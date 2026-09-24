/**
 * Responsive sweep against the served static export.
 *
 * Checks the review matrix from the brief (1440 / 1280 / 1024 / 768 / 390 / 375)
 * for the three things that are invisible until they are measured: horizontal
 * overflow, images that failed to load, and interactive targets under 44px.
 *
 * A development-time tool, not part of the smoke suite — the suite is a small
 * regression baseline, this is a sweep you run while building a page.
 *
 *   node scripts/check-viewports.mjs /cosmetics/products/
 */
import { chromium } from "@playwright/test";

const PORT = process.env.PORT ?? "4321";
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const reduced = process.argv.includes("--reduced");
const path = args[0] ?? "/cosmetics/products/";
const url = `http://localhost:${PORT}${path}`;

const VIEWPORTS = [1440, 1280, 1024, 768, 390, 375];

const browser = await chromium.launch();
let failures = 0;

for (const width of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    // With motion reduced, the reveals must resolve to their finished state
    // rather than never firing — a page that only exists after an animation is
    // a blank page for anyone who asked for less of them.
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const consoleErrors = [];
  const failed = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));

  await page.goto(url, { waitUntil: "networkidle" });

  // Walk the page so lazy images load and every scroll reveal fires.
  await page.evaluate(async () => {
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += 400) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    // A reveal takes --dur-slow (780ms) to finish. Measuring opacity the instant
    // the walk ends reports the last screens' elements as never revealed, which
    // is a property of this harness and not of the page.
    await new Promise((r) => setTimeout(r, 1000));
  });

  const result = await page.evaluate(() => {
    const brokenImages = [...document.querySelectorAll("img")]
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.getAttribute("src"));

    const small = [...document.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])')]
      // checkVisibility, not offsetParent: the closed mobile menu is a fixed,
      // visibility:hidden panel, so its links have an offsetParent but are not
      // focusable and must not be measured.
      .filter(
        (el) =>
          el.getAttribute("aria-hidden") !== "true" &&
          el.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true }),
      )
      .map((el) => ({ el, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.width > 0 && box.height > 0 && box.height < 44)
      .map(({ el, box }) => `${el.tagName.toLowerCase()}"${(el.textContent ?? "").trim().slice(0, 18)}" ${Math.round(box.height)}px`);

    // Anything sticking out past the viewport, named — "the page overflows" on
    // its own is not actionable.
    const overhang = [...document.body.querySelectorAll("*")]
      .filter((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && (box.right > window.innerWidth + 1 || box.left < -1);
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}`);

    const invisible = [...document.querySelectorAll(".reveal, .img-frame")].filter(
      (el) => Number(getComputedStyle(el).opacity) < 0.99,
    ).length;

    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      images: document.querySelectorAll("img").length,
      brokenImages,
      small,
      overhang,
      invisible,
    };
  });

  const overflows = result.scrollWidth > result.innerWidth + 1;
  const ok =
    !overflows &&
    result.brokenImages.length === 0 &&
    result.small.length === 0 &&
    result.invisible === 0 &&
    consoleErrors.length === 0 &&
    failed.length === 0;
  if (!ok) failures += 1;

  console.log(
    [
      `${ok ? "PASS" : "FAIL"}  ${String(width).padStart(4)}px`,
      `images ${result.images - result.brokenImages.length}/${result.images}`,
      `scrollW ${result.scrollWidth}`,
      overflows ? `OVERFLOW ${result.overhang.join(", ")}` : "",
      result.invisible ? `UNREVEALED ${result.invisible}` : "",
      result.small.length ? `SMALL TARGETS ${result.small.join(" | ")}` : "",
      consoleErrors.length ? `CONSOLE ${consoleErrors.join(" | ")}` : "",
      failed.length ? `REQUESTS ${failed.join(" | ")}` : "",
    ]
      .filter(Boolean)
      .join("  ·  "),
  );

  await page.close();
}

await browser.close();
console.log(failures === 0 ? "\nall viewports clean" : `\n${failures} viewport(s) failed`);
process.exit(failures === 0 ? 0 : 1);
