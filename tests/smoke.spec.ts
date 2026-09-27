import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke pass — DADAVAR.
 *
 * Deliberately small: the site renders and is RTL, every route survives a hard
 * load under the base path, the reference marks and the notes find each other
 * in both directions, every route carries its own metadata, and the site says
 * nothing about itself that is not true. Measurement — contrast, line length,
 * column direction, the marginal-note grid, the red-line grep — lives in
 * `scripts/verify.mjs`, not here.
 *
 * Rewritten for this architecture from the engine's suite. Kept: the
 * nameless-control check, the console/response watch, per-route metadata
 * uniqueness, sitemap/robots, structured data, the 404. Removed with the
 * features they tested, which this site does not have: the gallery lightbox and
 * the mobile menu.
 */

const rawBase = process.env.SMOKE_BASE_PATH ?? "/dadavar";
const BASE = rawBase === "/" ? "" : rawBase.replace(/\/+$/, "");

const AREAS = [
  "commercial-contracts",
  "intellectual-property",
  "arbitration",
  "formation-and-structure",
  "mergers-and-acquisitions",
  "compliance-and-governance",
  "commercial-litigation",
  "employment",
  "real-estate",
];
const ROUTES = ["/", "/practice/", "/notes/", "/about/", ...AREAS.map((s) => `/practice/${s}/`)];

/**
 * Every control must have a non-empty accessible name. The interface strings
 * live in `src/content/ui.ts`; a mistyped key there renders nothing visibly
 * wrong — the link still draws — and simply stops announcing itself, or
 * announces "undefined".
 */
async function namelessControls(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll("button, a[href]")]
      .filter((el) => (el as HTMLElement).checkVisibility({ visibilityProperty: true }))
      .filter((el) => el.closest('[aria-hidden="true"]') === null)
      .filter((el) => {
        const label = el.getAttribute("aria-label");
        const name = label === null ? (el.textContent ?? "") : label;
        return name.trim() === "" || name.includes("undefined") || /\{\w+\}/.test(name);
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

test("the homepage renders, is RTL, and loads every asset", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);
  const response = await page.goto(`${BASE}/`);
  expect(response?.status()).toBe(200);

  expect(await page.getAttribute("html", "dir")).toBe("rtl");
  expect(await page.getAttribute("html", "lang")).toBe("fa");
  expect(await page.evaluate(() => getComputedStyle(document.body).direction)).toBe("rtl");

  await expect(page.locator("h1")).toHaveCount(1);
  // Nine areas in three groups, each an ordered list of three.
  await expect(page.locator(".area-index section")).toHaveCount(3);
  await expect(page.locator(".area-list > li")).toHaveCount(9);

  await page.evaluate(async () => {
    for (const img of document.images) img.loading = "eager";
    await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
  });
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => i.naturalWidth === 0).map((i) => i.src),
  );
  expect(broken, "broken images").toEqual([]);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "horizontal overflow").toBe(0);

  expect(await namelessControls(page), "controls without an accessible name").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
  expect(failed, "failed requests").toEqual([]);
});

test("every practice route survives a hard load under the base path", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  for (const slug of AREAS) {
    const response = await page.goto(`${BASE}/practice/${slug}/`);
    expect(response?.status(), slug).toBe(200);

    await expect(page.locator("h1"), `${slug} has one h1`).toHaveCount(1);
    await expect(page.locator(".essay .marginal"), `${slug} marginal note`).toHaveCount(1);
    await expect(page.locator(".essay .initial"), `${slug} word-scale initial`).toHaveCount(1);

    // Two or three reference marks, each a real link to a note.
    const marks = await page.locator("a.refmark").evaluateAll((els) =>
      els.map((a) => ({ id: a.id, href: a.getAttribute("href"), label: a.getAttribute("aria-label") })),
    );
    expect(marks.length, `${slug} mark count`).toBeGreaterThanOrEqual(2);
    expect(marks.length, `${slug} mark count`).toBeLessThanOrEqual(3);
    for (const mark of marks) {
      expect(mark.href, `${slug} mark target`).toMatch(new RegExp(`^${BASE}/notes/#note-[123]$`));
      expect(mark.id, `${slug} mark id`).toMatch(new RegExp(`^ref-${slug}-\\d$`));
      expect(mark.label, `${slug} mark name`).toMatch(/^یادداشت [۱۲۳]: /);
    }

    // The other two areas in the group, and the index.
    await expect(page.locator(".linkset li"), `${slug} related links`).toHaveCount(3);
    expect(await namelessControls(page), `${slug} nameless controls`).toEqual([]);
  }

  expect(consoleErrors, "console errors").toEqual([]);
  expect(failed, "failed requests").toEqual([]);
});

test("a reference mark and its note find each other in both directions", async ({ page }) => {
  await page.goto(`${BASE}/practice/arbitration/`);
  const mark = page.locator("a.refmark").first();
  const markId = await mark.getAttribute("id");
  const target = (await mark.getAttribute("href"))!.split("#")[1];

  await mark.click();
  await expect(page).toHaveURL(new RegExp(`${BASE}/notes/#${target}$`));
  await expect(page.locator(`#${target}`)).toHaveCount(1);

  // The note lists a way back to this exact mark, not just to the page.
  const back = page.locator(`#${target} .backrefs a[href$="#${markId}"]`);
  await expect(back).toHaveCount(1);
  await back.click();
  await expect(page).toHaveURL(new RegExp(`${BASE}/practice/arbitration/#${markId}$`));
  await expect(page.locator(`#${markId}`)).toHaveCount(1);
});

test("the notes page carries all three notes and every back-reference resolves", async ({ page }) => {
  await page.goto(`${BASE}/notes/`);
  await expect(page.locator("article.note")).toHaveCount(3);

  const backs = await page
    .locator(".backrefs a")
    .evaluateAll((els) => els.map((a) => a.getAttribute("href")!));
  // Twenty-one marks across nine pages; every one gets its own way back.
  expect(backs.length).toBe(21);

  for (const href of backs) {
    const [path, id] = href.split("#");
    const html = await (await page.request.get(path)).text();
    expect(html, `${href} resolves`).toContain(`id="${id}"`);
  }
});

test("the index lists nine areas and the masthead's group anchors land on it", async ({ page }) => {
  await page.goto(`${BASE}/practice/`);
  await expect(page.locator(".area-list > li")).toHaveCount(9);

  const anchors = await page
    .locator(".masthead-nav a")
    .evaluateAll((els) => els.map((a) => a.getAttribute("href")!));
  expect(anchors.length).toBe(3);
  for (const href of anchors) {
    const id = href.split("#")[1];
    await expect(page.locator(`#${id}`), `${href} resolves`).toHaveCount(1);
  }
});

test("every route carries its own metadata, noindexed, under the base path", async ({ page }) => {
  const seen = new Map<string, string[]>();

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`);

    const meta = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    }));

    expect(meta.title, `${route} title`).toBeTruthy();
    expect(meta.description, `${route} description`).toBeTruthy();
    expect(meta.ogTitle, `${route} og:title matches the title`).toBe(meta.title);

    // On a Pages project site robots.txt sits where no crawler reads it; the
    // meta tag is what keeps a demonstration of a fictional firm unindexed.
    expect(meta.robots, `${route} robots meta`).toMatch(/noindex/);
    expect(meta.robots, `${route} robots meta`).toMatch(/nofollow/);

    for (const [name, value] of [
      ["canonical", meta.canonical],
      ["og:url", meta.ogUrl],
      ["og:image", meta.ogImage],
    ] as const) {
      expect(value, `${route} ${name} is absolute`).toMatch(/^https?:\/\//);
      if (BASE) expect(value, `${route} ${name} carries the base path`).toContain(`${BASE}/`);
    }
    expect(new URL(meta.canonical!).pathname, `${route} canonical points at itself`).toBe(`${BASE}${route}`);

    for (const [field, value] of Object.entries(meta)) {
      if (field === "ogImage" || field === "robots") continue; // shared on purpose
      const list = seen.get(field) ?? [];
      expect(list, `${route} ${field} is unique across routes`).not.toContain(value);
      list.push(value as string);
      seen.set(field, list);
    }
  }
});

test("the sitemap lists thirteen absolute routes and robots.txt disallows all", async ({ page }) => {
  const sitemap = await page.request.get(`${BASE}/sitemap.xml`);
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const route of ROUTES) expect(xml, `sitemap lists ${route}`).toContain(`${BASE}${route}</loc>`);
  expect(xml.match(/<loc>/g)?.length, "sitemap entry count").toBe(13);
  expect(xml, "no relative loc").not.toMatch(/<loc>\//);

  const robots = await page.request.get(`${BASE}/robots.txt`);
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toMatch(/Disallow: \/\s*$/m);
});

test("structured data parses and claims nothing about a firm that does not exist", async ({ page }) => {
  await page.goto(`${BASE}/`);
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((el) => el.textContent ?? ""));
  expect(blocks.length, "one Organization block").toBe(1);

  const org = JSON.parse(blocks[0]) as Record<string, unknown>;
  expect(org["@type"]).toBe("Organization");
  expect(String(org.url)).toContain(`${BASE}/`);
  for (const field of [
    "sameAs",
    "logo",
    "founder",
    "foundingDate",
    "award",
    "memberOf",
    "hasCredential",
    "aggregateRating",
    "review",
    "areaServed",
    "address",
    "telephone",
  ]) {
    expect(org[field], `Organization must not assert ${field}`).toBeUndefined();
  }
});

test("contact runs through two plain links, and there is no form", async ({ page }) => {
  await page.goto(`${BASE}/`);
  const tel = page.locator('.cta-links a[href^="tel:"]');
  await expect(tel).toHaveCount(1);

  const chat = page.locator('.cta-links a[href^="https://wa.me/"]');
  const href = (await chat.getAttribute("href"))!;
  expect(decodeURIComponent(href.split("?text=")[1])).toContain("دادآور");
  expect(await chat.getAttribute("target")).toBe("_blank");
  expect(await chat.getAttribute("rel")).toContain("noopener");

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`);
    const counts = await page.evaluate(() => ({
      forms: document.querySelectorAll("form, input, textarea, select").length,
      tables: document.querySelectorAll("table").length,
    }));
    expect(counts.forms, `${route} has no form`).toBe(0);
    expect(counts.tables, `${route} has no table`).toBe(0);
  }
});

test("an unknown path answers 404 with a way back", async ({ page }) => {
  const response = await page.goto(`${BASE}/no-such-page/`);
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveCount(1);
  const links = await page
    .locator(".linkset a")
    .evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  expect(links).toEqual([`${BASE}/`, `${BASE}/practice/`]);
});
