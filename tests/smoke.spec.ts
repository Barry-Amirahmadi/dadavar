import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke pass — deliberately small.
 *
 * Scope is the regression baseline the architect approved: the site renders,
 * it is genuinely RTL, the lightbox opens, a product route survives a hard load
 * under the base path, and nothing 404s. It is not coverage, and it should not
 * grow into coverage — add cases when a page is added, not speculatively.
 *
 * Every assertion here corresponds to a defect that actually happened, which is
 * the only reason each one is worth a test.
 */

/**
 * The deployment base path. Spelled out rather than folded into `baseURL`:
 * these tests exist largely to catch base-path regressions, so it should be
 * visible at every call site.
 */
const rawBase = process.env.SMOKE_BASE_PATH ?? "/cosmetics";
const BASE = rawBase === "/" ? "" : rawBase.replace(/\/+$/, "");

/** Persian digits back to a number, so a rendered count can be compared. */
function fromFa(text: string): number {
  return Number(text.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, ""));
}

/**
 * Every control on the page must have a non-empty accessible name.
 *
 * This exists because the interface strings moved out of the components and
 * into `src/content/ui.ts`. A mistyped path there does not throw and does not
 * render visibly wrong — the button still draws, still works, and simply stops
 * announcing itself, or announces the word "undefined". That is invisible to
 * every other check in this file and to anyone looking at the screen.
 */
async function namelessControls(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll("button, a[href]")]
      .filter((el) => (el as HTMLElement).checkVisibility({ visibilityProperty: true }))
      // An aria-hidden subtree is not in the accessibility tree, so nothing in
      // it needs a name. The product cards put a second, deliberately hidden
      // link on the image behind the named one — skipping these is the
      // difference between a check and a false alarm.
      .filter((el) => el.closest('[aria-hidden="true"]') === null)
      .filter((el) => {
        const label = el.getAttribute("aria-label");
        const name = label === null ? (el.textContent ?? "") : label;
        return name.trim() === "" || name.includes("undefined");
      })
      .map((el) => `${el.tagName.toLowerCase()}.${el.className || "(no class)"}`),
  );
}

/** Collects console errors and failed responses for the lifetime of a page. */
function watch(page: Page) {
  const consoleErrors: string[] = [];
  const failed: string[] = [];

  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });

  return { consoleErrors, failed };
}

test("homepage renders, is RTL, and loads every asset", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  await page.goto(`${BASE}/`);

  await expect(page.locator("h1")).toHaveText("زیبایی، آهسته اتفاق می‌افتد");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");

  // Native RTL, not just an attribute — the grid must resolve right-to-left.
  const direction = await page.evaluate(() => getComputedStyle(document.body).direction);
  expect(direction).toBe("rtl");

  // Walk the page so lazy images and scroll reveals all fire.
  await page.evaluate(async () => {
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += 400) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 50));
    }
  });

  // Regression: next/image does not apply basePath when images are unoptimized,
  // which silently broke all 26 images on the project site.
  const broken = await page.evaluate(
    () =>
      [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0)
        .length,
  );
  expect(broken, "images failing to load").toBe(0);

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflows, "horizontal overflow").toBe(false);

  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

test("gallery lightbox opens and closes", async ({ page }) => {
  await page.goto(`${BASE}/`);

  // Nothing else in this suite sees the header, footer and tile controls at
  // rest, and they are where most of `ui.ts` is consumed.
  expect(await namelessControls(page), "controls with no accessible name").toEqual([]);

  const firstTile = page.locator("#gallery .gallery-tile").first();
  await firstTile.scrollIntoViewIfNeeded();
  await firstTile.click();

  const dialog = page.locator("dialog.lightbox");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(dialog).toHaveAttribute("aria-label", /\S/);

  // The lightbox's own controls exist only while it is open, so they are absent
  // from the exported HTML and can only be checked here.
  expect(await namelessControls(page), "lightbox controls with no name").toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveJSProperty("open", false);
});

test("a product route survives a hard load under the base path", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  // Hard load, not a client-side navigation: this is the case that 404'd on the
  // dynamic route's RSC payload, and the case a static host has to get right.
  const response = await page.goto(`${BASE}/products/shab/`);
  expect(response?.status()).toBe(200);

  await expect(page.locator("h1")).toHaveText("سرم شب");

  // Regression: a raw <a href="/"> skips basePath and leaves the site entirely.
  const homeLink = page.locator('nav[aria-label="مسیر صفحه"] a').first();
  await expect(homeLink).toHaveAttribute("href", `${BASE}/`);

  // The site's only conversion point (§42). A malformed number or an unencoded
  // message produces a link that looks fine and opens an empty chat.
  const inquiry = page.locator('a[href^="https://wa.me/"]');
  const inquiryHref = await inquiry.getAttribute("href");
  expect(inquiryHref, "WhatsApp inquiry link").toBeTruthy();
  expect(decodeURIComponent(inquiryHref!), "product name prefilled").toContain("سرم شب");
  expect(inquiryHref!, "digits only in the wa.me path").toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  await expect(inquiry).toHaveAttribute("rel", /noopener/);

  // Related products must lead somewhere else — a page linking to itself here
  // is the failure mode of every naive "related" implementation.
  const relatedLinks = await page
    .locator('section[aria-labelledby="related-heading"] article a[href]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  expect(relatedLinks.length).toBeGreaterThan(0);
  expect(relatedLinks.some((href) => href.includes("/products/shab"))).toBe(false);

  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

test("the collection page lists the catalogue and its index resolves", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  const response = await page.goto(`${BASE}/products/`);
  expect(response?.status()).toBe(200);

  await expect(page.locator("h1")).toHaveText("همهٔ محصولات، کنار هم");

  // Regression: nav hrefs written as bare hashes pointed at homepage sections
  // and resolved to nothing once the header rendered on a second page.
  await expect(
    page.locator('header nav[aria-label="پیمایش اصلی"] a[aria-current="page"]'),
  ).toHaveText("محصولات");

  // The index is only structure if its targets exist. A category anchor that
  // points at a removed product fails silently — the page just does not move.
  const items = page.locator("article[id^='product-']");
  const count = await items.count();
  expect(count).toBeGreaterThan(0);

  const anchors = await page
    .locator(".collection-index__link")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  expect(anchors.length).toBeGreaterThan(0);
  for (const anchor of anchors) {
    await expect(page.locator(anchor), `index anchor ${anchor}`).toHaveCount(1);
  }

  // The printed count is derived, so it must never disagree with what is shown.
  const printed = await page.locator(".collection-index p.t-meta").innerText();
  expect(fromFa(printed)).toBe(count);

  await page.evaluate(async () => {
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += 400) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 50));
    }
  });

  const broken = await page.evaluate(
    () =>
      [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0)
        .length,
  );
  expect(broken, "images failing to load").toBe(0);

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflows, "horizontal overflow").toBe(false);

  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

test("the gallery page composes every plate and opens the right one", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  const response = await page.goto(`${BASE}/gallery/`);
  expect(response?.status()).toBe(200);

  await expect(page.locator("h1")).toHaveText("تصویرها، بی‌عجله");
  await expect(
    page.locator('header nav[aria-label="پیمایش اصلی"] a[aria-current="page"]'),
  ).toHaveText("گالری");

  // Every image must survive the banding. A composition that drops the last
  // item when the count is odd loses it silently.
  const tiles = page.locator(".ground-light-deep .gallery-tile");
  const count = await tiles.count();
  expect(count).toBeGreaterThan(0);

  // The plates are laid out in bands, so each tile has a position within its
  // band *and* a position in the gallery. The lightbox needs the second one —
  // passing the band-local index opens the wrong picture, which looks like a
  // working lightbox rather than like a bug.
  const third = tiles.nth(2);
  await third.scrollIntoViewIfNeeded();
  await third.click();
  const dialog = page.locator("dialog.lightbox");
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(dialog.locator(".t-h3")).toHaveText("سرم شب");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveJSProperty("open", false);

  const broken = await page.evaluate(
    () =>
      [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0)
        .length,
  );
  expect(broken, "images failing to load").toBe(0);

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflows, "horizontal overflow").toBe(false);

  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

test("the about page owns the contact anchor and both inquiry paths", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  const response = await page.goto(`${BASE}/about/`);
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("چرا مجموعه کوچک است");

  // Exactly one #contact. The footer carried this id through Phase 01 and the
  // footer renders on this page too — two of them is a silent duplicate-id
  // defect that makes the nav anchor land on whichever comes first.
  await expect(page.locator("#contact")).toHaveCount(1);

  // Both inquiry paths of §42, and neither may be a dead "#".
  const chat = page.locator('#contact a[href^="https://wa.me/"]');
  await expect(chat).toHaveCount(1);
  await expect(chat).toHaveAttribute("rel", /noopener/);

  const instagram = page.locator('#contact a[href*="instagram.com"]');
  await expect(instagram).toHaveCount(1);
  await expect(instagram).toHaveAttribute("rel", /noopener/);

  // No link anywhere on the page may be a bare "#": it looks like a link,
  // focuses like a link, and jumps the reader to the top of the page.
  const deadLinks = await page
    .locator('a[href="#"]')
    .evaluateAll((els) => els.map((el) => (el.textContent ?? "").trim()));
  expect(deadLinks, "links pointing at #").toEqual([]);

  const broken = await page.evaluate(
    () =>
      [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0)
        .length,
  );
  expect(broken, "images failing to load").toBe(0);

  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

test("every route carries its own metadata, under the deployed base path", async ({ page }) => {
  const routes = [
    "/",
    "/products/",
    "/gallery/",
    "/about/",
    "/products/shab/",
    "/products/aram/",
  ];

  const seen = new Map<string, string[]>();

  for (const route of routes) {
    await page.goto(`${BASE}${route}`);

    const meta = await page.evaluate(() => ({
      title: document.title,
      description: document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
    }));

    expect(meta.title, `${route} title`).toBeTruthy();
    expect(meta.description, `${route} description`).toBeTruthy();

    // og:title was set once in the root layout and inherited by every route, so
    // a shared link to any page previewed as the homepage.
    expect(meta.ogTitle, `${route} og:title matches the page title`).toBe(meta.title);

    // The canonical has to carry the base path. `configure-pages` reports the
    // origin and the base path as two separate values, and a canonical built
    // from the origin alone points at someone else's site — which actively
    // tells a search engine to index that one instead of this one.
    for (const [name, value] of [
      ["canonical", meta.canonical],
      ["og:url", meta.ogUrl],
      ["og:image", meta.ogImage],
    ] as const) {
      expect(value, `${route} ${name} is absolute`).toMatch(/^https?:\/\//);
      if (BASE) expect(value, `${route} ${name} carries the base path`).toContain(`${BASE}/`);
    }

    expect(new URL(meta.canonical!).pathname, `${route} canonical points at itself`).toBe(
      `${BASE}${route}`,
    );

    for (const [field, value] of Object.entries(meta)) {
      if (field === "ogImage") continue; // one card, shared by every route on purpose
      const list = seen.get(field) ?? [];
      expect(list, `${route} ${field} is unique across routes`).not.toContain(value);
      list.push(value as string);
      seen.set(field, list);
    }
  }
});

test("the sitemap and robots.txt are exported and absolute", async ({ page }) => {
  const sitemap = await page.request.get(`${BASE}/sitemap.xml`);
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();

  // Every exported route must be listed, and every entry absolute — a relative
  // <loc> is invalid in a sitemap and is dropped silently.
  for (const route of ["/", "/products/", "/gallery/", "/about/", "/products/shab/"]) {
    expect(xml, `sitemap lists ${route}`).toContain(`${BASE}${route}</loc>`);
  }
  expect(xml.match(/<loc>/g)?.length, "sitemap entry count").toBe(9);
  expect(xml, "no relative loc").not.toMatch(/<loc>\//);

  // Drafts are filtered out of publishedProducts and must not be advertised.
  expect(xml, "no draft product").not.toContain("/404");

  const robots = await page.request.get(`${BASE}/robots.txt`);
  expect(robots.status()).toBe(200);
  expect(await robots.text(), "robots points at the sitemap").toContain(
    `${BASE}/sitemap.xml`,
  );
});

test("structured data parses and claims nothing invented", async ({ page }) => {
  await page.goto(`${BASE}/products/shab/`);

  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((el) => el.textContent ?? ""));
  expect(blocks.length, "Organization + Product").toBe(2);

  const parsed = blocks.map((b) => JSON.parse(b) as Record<string, unknown>);
  const product = parsed.find((p) => p["@type"] === "Product")!;
  const organization = parsed.find((p) => p["@type"] === "Organization")!;

  expect(product.name).toBe("سرم شب");
  expect(String(product.url)).toContain(`${BASE}/products/shab/`);

  // The point of the schema file: it must stay a mapping of data that exists.
  // `offers` and a rating are what a generator would invent to earn a rich
  // result, and this site has no commerce and no reviews at all.
  for (const field of ["offers", "aggregateRating", "review", "sku", "gtin"]) {
    expect(product[field], `Product must not assert ${field}`).toBeUndefined();
  }
  // The social handles are `.example` placeholders; sameAs would claim the
  // brand owns accounts that do not resolve.
  expect(organization.sameAs, "Organization must not assert sameAs").toBeUndefined();
});

/**
 * Found in the Part 4 full-site pass, which is the only pass that ever left the
 * mobile menu by a route rather than by the close button.
 *
 * Four of the six internal controls in the panel carried `onClick={onClose}`.
 * The lockup and the CTA did not — and `Button` accepted an `onClick` it then
 * dropped for links, so even passing one would not have helped. Tapping either
 * navigated underneath a panel that stayed over the whole screen with
 * `body { overflow: hidden }` still set, stranding a phone visitor on the
 * site's primary mobile call to action.
 *
 * Asserted for every control rather than for the two that were broken: the
 * defect is one control forgetting, so the check has to be the whole set.
 */
test("every control that leaves the mobile menu closes it", async ({ page }, testInfo) => {
  // The toggle is `lg:hidden`; above that breakpoint the panel is not part of
  // the interface at all, so this is a mobile-project test by nature.
  test.skip(
    (testInfo.project.use.viewport?.width ?? 0) >= 1024,
    "the mobile panel does not exist at desktop widths",
  );

  await page.goto(`${BASE}/`);

  const panel = page.locator(".menu-panel");
  const internal = page.locator('.menu-panel a[href^="/"]');

  await page.locator(".menu-toggle").first().click();
  await expect(panel).toHaveAttribute("data-open", "true");
  const count = await internal.count();
  expect(count, "the panel's own links").toBeGreaterThan(3);

  for (let i = 0; i < count; i += 1) {
    await page.goto(`${BASE}/`);
    await page.locator(".menu-toggle").first().click();
    await expect(panel).toHaveAttribute("data-open", "true");

    const href = await internal.nth(i).getAttribute("href");
    await internal.nth(i).click();

    await expect(panel, `${href} left the panel open`).toHaveAttribute("data-open", "false");
    // The panel locks page scrolling while it is open; a panel that closes
    // without releasing that lock leaves a page nobody can scroll.
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow), {
        message: `${href} left the page scroll-locked`,
      })
      .not.toBe("hidden");
  }
});

test("an unknown path serves the styled 404", async ({ page }) => {
  const response = await page.goto(`${BASE}/definitely-not-a-page/`);

  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("این نشانی وجود ندارد");
});

/**
 * A form with nowhere to post is worse than no form: on a static host the
 * browser falls back to a GET at the current URL, so the page reloads, the
 * scroll position is lost, and whatever the visitor typed — an email address,
 * here — is written into the URL and therefore into history and any outgoing
 * referrer. The footer shipped exactly that from Phase 01 until the final pass
 * measured it. §42 permits a form only when it posts to a real third-party
 * backend, so this asserts the site has no form that resolves to neither.
 */
test("no route carries a form that submits nowhere", async ({ page }) => {
  const routes = ["/", "/products/", "/gallery/", "/about/", "/products/shab/"];

  for (const route of routes) {
    await page.goto(`${BASE}${route}`);

    const dead = await page.evaluate(() =>
      [...document.querySelectorAll("form")]
        .filter((f) => {
          const action = f.getAttribute("action");
          return action === null || action === "" || action === "#";
        })
        .map((f) => f.className || "(no class)"),
    );

    expect(dead, `${route} has a form posting nowhere`).toEqual([]);
  }
});
