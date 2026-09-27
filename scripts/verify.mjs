/**
 * verify.mjs — the §13 pass, in one script, against the real static export.
 *
 *   npm run build:pages && node scripts/verify.mjs
 *
 * Serves `out/` the way GitHub Pages does (scripts/serve-static.mjs, under the
 * /dadavar base path), walks all fourteen routes at 390, 1024 and 1440px in
 * headless Chromium, and prints numbers. It never takes a screenshot: every
 * check below is a measurement, and a measurement is something a script can
 * fail on.
 *
 * Exit code is non-zero on any failure. The red-line grep is a blocking
 * failure, not a note.
 */
import { chromium } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const out = join(root, "out");
const BASE = "/dadavar";
const PORT = Number(process.env.VERIFY_PORT ?? 4417);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const WIDTHS = [390, 1024, 1440];

const failures = [];
const fail = (msg) => failures.push(msg);
const line = (s = "") => console.log(s);
const head = (s) => line(`\n── ${s} ${"─".repeat(Math.max(0, 74 - s.length))}`);

if (!existsSync(join(out, "index.html"))) {
  console.error("no out/index.html — run `npm run build:pages` first");
  process.exit(1);
}

/* ========================================================================== */
/*  Routes                                                                    */
/* ========================================================================== */

const slugs = readdirSync(join(out, "practice"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("__"))
  .map((d) => d.name)
  .sort();
/* The fourteenth route is the 404: a path that does not exist, which the
   static server answers the way GitHub Pages does — status 404, body 404.html.
   (Not `/404/`: the export writes a real `404/index.html` that answers 200.) */
const MISSING = "/no-such-page/";
const ROUTES = ["/", "/practice/", ...slugs.map((s) => `/practice/${s}/`), "/notes/", "/about/", MISSING];
const EXPECTED_STATUS = (route) => (route === MISSING ? 404 : 200);

/* ========================================================================== */
/*  Static checks — on the built files, no browser                            */
/* ========================================================================== */

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
const files = walk(out);
const textFiles = files.filter((f) => [".html", ".txt", ".xml", ".json", ".js", ".css"].includes(extname(f)));

/* ---- The red-line grep ---------------------------------------------------- */

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** Two normalisations, and a pattern hits if it matches either. */
function normalise(s, zwnj) {
  return s
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/‌/g, zwnj)
    .replace(/[\s ]+/g, " ")
    .toLowerCase();
}
const RED_LINES = [
  ["پروانه وکالت"],
  ["کانون وکلا"],
  ["شماره پروانه"],
  ["عضو کانون"],
  ["تضمین"],
  ["برنده"],
  ["موفقیت ٪", /موفقیت ?[٪%]|[٪%] ?موفقیت/],
  ["نرخ موفقیت"],
  ["برترین"],
  ["بهترین"],
  ["رتبه"],
  ["جایزه"],
  ["ماده + رقم", /ماده \d/],
  ["قانون مدنی"],
  ["قانون تجارت"],
  ["رقم + پرونده", /\d پرونده/],
  ["اگر شما"],
  ["توصیه می‌کنیم"],
  ["باید اقدام کنید"],
];
const corpusA = [];
const corpusB = [];
for (const f of files.filter((f) => [".html", ".txt", ".xml", ".json"].includes(extname(f)))) {
  const raw = readFileSync(f, "utf8");
  corpusA.push([f, normalise(raw, " ")]);
  corpusB.push([f, normalise(raw, "")]);
}
head("RED-LINE GREP — built output, normalised for ZWNJ, spacing, ي/ك and digits");
const redLineRows = [];
for (const [label, re] of RED_LINES) {
  let count = 0;
  const where = new Set();
  for (const corpus of [corpusA, corpusB]) {
    const zw = corpus === corpusA ? " " : "";
    const pattern = re ?? new RegExp(normalise(label, zw).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const g = new RegExp(pattern.source, "g");
    for (const [f, text] of corpus) {
      const hits = text.match(g);
      if (hits) {
        count += hits.length;
        where.add(f.slice(out.length + 1));
      }
    }
  }
  redLineRows.push([label, count, [...where].slice(0, 3).join(", ")]);
  line(`  ${String(count).padStart(3)}  ${label}${count ? `   ← ${[...where].slice(0, 3).join(", ")}` : ""}`);
  if (count) fail(`red line «${label}»: ${count} hit(s)`);
}

/* ---- Shipped CSS, leftovers, dependencies -------------------------------- */

head("SHIPPED CSS AND LEFTOVERS");
const cssFiles = files.filter((f) => extname(f) === ".css");
const css = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");
const firstLetter = (css.match(/first-letter/gi) ?? []).length;
line(`  ::first-letter in shipped CSS: ${firstLetter}`);
if (firstLetter) fail("::first-letter present in shipped CSS");
const justify = (css.match(/text-align\s*:\s*justify/gi) ?? []).length;
line(`  text-align: justify in shipped CSS: ${justify}`);
if (justify) fail("text-align: justify present in shipped CSS");

let leftovers = 0;
for (const f of textFiles) {
  const hits = readFileSync(f, "utf8").match(/parnian|cosmetics|پرنیان/gi);
  if (hits) {
    leftovers += hits.length;
    line(`  leftover in ${f.slice(out.length + 1)}: ${[...new Set(hits)].join(", ")}`);
  }
}
line(`  parnian / cosmetics / پرنیان in built output: ${leftovers}`);
if (leftovers) fail("sibling-template leftovers in built output");

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const deps = Object.keys(pkg.dependencies ?? {});
line(`  runtime dependencies: ${deps.length} (${deps.join(", ")})`);
if (deps.length !== 3) fail("runtime dependencies ≠ 3");

/* ---- Glyph coverage, from the font files that actually shipped ----------- */

head("GLYPHS — cmap of every shipped Arabic-range font file");
const GLYPHS = "پچژگکیه۰۱۲۳۴۵۶۷۸۹";
const faces = [];
for (const f of cssFiles) {
  const text = readFileSync(f, "utf8");
  for (const block of text.match(/@font-face\s*{[^}]*}/g) ?? []) {
    const family = block.match(/font-family\s*:\s*([^;]+);/)?.[1]?.replace(/['"]/g, "").trim();
    const url = block.match(/url\(([^)]+)\)/)?.[1]?.replace(/['"]/g, "");
    const range = block.match(/unicode-range\s*:\s*([^;}]+)/)?.[1] ?? ""; // last declaration: no ";" when minified
    // Minified CSS writes the Arabic block as `U+6??`, unminified as `U+0600-06FF`.
    if (!family || !url || !/U\+0?6(00|\?\?)/i.test(range)) continue;
    const path = url.startsWith("/") ? join(out, url.replace(BASE, "")) : resolve(dirname(f), url);
    faces.push({ family, path });
  }
}
if (!faces.length) fail("no Arabic-range @font-face found in shipped CSS — the cmap check had nothing to read");
const py = spawnSync(
  "python",
  [
    "-c",
    `import sys,json
from fontTools.ttLib import TTFont
need=sys.argv[1]; res={}
for p in sys.argv[2:]:
    c=TTFont(p).getBestCmap(); res[p]=[ch for ch in need if ord(ch) not in c]
print(json.dumps(res))`,
    GLYPHS,
    ...faces.map((f) => f.path),
  ],
  { encoding: "utf8" },
);
if (py.status !== 0) {
  line(`  fontTools unavailable — cmap check NOT run: ${py.stderr.trim().split("\n").pop()}`);
  fail("cmap glyph check could not run");
} else {
  const res = JSON.parse(py.stdout);
  for (const face of faces) {
    const missing = res[face.path];
    line(`  ${face.family.padEnd(28)} ${missing.length ? `MISSING ${missing.join(" ")}` : "all 18 present"}`);
    if (missing.length) fail(`${face.family} lacks ${missing.join(" ")}`);
  }
}

/* ========================================================================== */
/*  Browser checks                                                            */
/* ========================================================================== */

const server = spawn(process.execPath, [join(here, "serve-static.mjs"), "--port", String(PORT), "--base", "dadavar"], {
  stdio: "ignore",
});
const stop = () => server.kill();
process.on("exit", stop);

for (let i = 0; i < 50; i++) {
  try {
    const r = await fetch(`${ORIGIN}${BASE}/`);
    if (r.ok) break;
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 200));
}

/** Runs inside the page. Pure measurement; returns plain data. */
function audit() {
  const parse = (s) => {
    let m = s.match(/^rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    m = s.match(/^color\(srgb ([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s/]+/).filter(Boolean).map(Number);
      return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 };
    }
    return null;
  };
  const over = (top, bottom) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  });
  const background = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a >= 1) break;
      }
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg);
    return bg;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const hex = ({ r, g, b }) =>
    "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const describe = (el) =>
    `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""}`;

  const res = { width: innerWidth };
  res.scroll = { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };

  /* Contrast and letter-spacing over every text node. */
  const contrast = {};
  const spacing = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el || el.closest("script,style,noscript,template,.sr-only")) continue;
    if (!el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden") continue;
    const fg = parse(cs.color);
    const bg = background(el);
    const value = ratio(fg.a < 1 ? over(fg, bg) : fg, bg);
    const key = hex(fg);
    if (!contrast[key] || value < contrast[key].ratio) {
      contrast[key] = { ratio: value, on: hex(bg), el: describe(el), text: text.slice(0, 24) };
    }
    if (/[؀-ۿ]/.test(text) && !["normal", "0px"].includes(cs.letterSpacing)) {
      spacing.push(`${describe(el)} ${cs.letterSpacing}`);
    }
  }
  res.contrast = contrast;
  res.spacing = spacing;
  res.tables = document.querySelectorAll("table").length;

  /* Anchors, ids, internal paths. */
  res.ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
  res.links = [];
  for (const a of document.querySelectorAll("a[href]")) {
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) continue;
    res.links.push({ path: url.pathname, hash: url.hash ? decodeURIComponent(url.hash.slice(1)) : "" });
  }
  /* Links must not rely on colour alone: underline, or a raised reference mark. */
  res.bareLinks = [...document.querySelectorAll("a[href]")]
    .filter((a) => !a.closest(".sr-only") && a.getClientRects().length)
    .filter((a) => {
      const cs = getComputedStyle(a);
      if (cs.textDecorationLine.includes("underline")) return false;
      if (a.classList.contains("refmark") && cs.verticalAlign === "super") return false;
      if (a.classList.contains("wordmark") || a.classList.contains("skip-link")) return false;
      return true;
    })
    .map((a) => describe(a));

  /* Words of an element, in DOM order, with their first client rect. */
  const wordsOf = (el) => {
    const words = [];
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      if (n.parentElement.closest(".refmark")) continue;
      const re = /\S+/g;
      let m;
      while ((m = re.exec(n.textContent))) {
        const r = document.createRange();
        r.setStart(n, m.index);
        r.setEnd(n, m.index + m[0].length);
        const rect = r.getClientRects()[0];
        if (rect) words.push({ w: m[0].replace(/‌/g, ""), rect, initial: !!n.parentElement.closest(".initial") });
      }
    }
    return words;
  };
  /* Group words into lines. RTL: a new line starts when a word does not sit
     to the left of the previous one on the same band — this also catches the
     jump to the top of the next column. */
  const linesOf = (words) => {
    const lines = [];
    let cur = null;
    let prev = null;
    for (const word of words) {
      const r = word.rect;
      const sameBand = prev && r.top < prev.bottom && r.bottom > prev.top;
      const leftward = prev && r.right <= prev.left + 1;
      if (!cur || !(sameBand && leftward)) {
        cur = { words: [], right: r.right, top: r.top, initial: false };
        lines.push(cur);
      }
      cur.words.push(word.w);
      cur.initial ||= word.initial;
      prev = r;
    }
    return lines.map((l) => ({ chars: l.words.join(" ").length, right: l.right, top: l.top, initial: l.initial }));
  };

  /* Prose blocks. */
  res.prose = [];
  for (const block of document.querySelectorAll("[data-prose]")) {
    const cs = getComputedStyle(block);
    const lengths = [];
    const aligns = new Set([cs.textAlign]);
    for (const p of block.querySelectorAll("p")) {
      aligns.add(getComputedStyle(p).textAlign);
      /* Full lines only: not a paragraph's last line, and not the line that
         carries the word-scale initial, whose first words are display type
         at 1.5em and so hold fewer characters by design. */
      const ls = linesOf(wordsOf(p));
      for (const l of ls.slice(0, -1)) if (!l.initial) lengths.push(l.chars);
    }
    const sorted = [...lengths].sort((a, b) => a - b);
    const entry = {
      kind: block.dataset.prose,
      median: sorted.length ? sorted[Math.floor(sorted.length / 2)] : null,
      display: cs.display,
      columns: cs.columnCount,
      aligns: [...aligns],
      min: lengths.length ? Math.min(...lengths) : null,
      max: lengths.length ? Math.max(...lengths) : null,
      lines: lengths.length,
      short: lengths.filter((n) => n < 45).length,
      long: lengths.filter((n) => n > 75).length,
    };
    /* Column direction: the right edge of column one's first line against
       column two's. */
    if (block.classList.contains("cols") && cs.display !== "contents" && cs.columnCount === "2") {
      const words = wordsOf(block);
      const jump = words.findIndex((w, i) => i > 0 && w.rect.top < words[i - 1].rect.top - 20);
      if (jump > 0) entry.direction = { first: Math.round(words[0].rect.right), second: Math.round(words[jump].rect.right) };
      else entry.direction = { first: Math.round(words[0]?.rect.right ?? 0), second: null };
      /* break-inside / break-after on subheads. */
      entry.subheads = [...block.querySelectorAll(".subhead")].map((h) => {
        const rects = h.getClientRects();
        const next = h.nextElementSibling ? wordsOf(h.nextElementSibling)[0]?.rect : null;
        const hr = rects[0];
        const sameColumn = next ? Math.abs(next.right - hr.right) < 4 && next.top >= hr.bottom - 2 : true;
        return { fragments: rects.length, sameColumn };
      });
    }
    res.prose.push(entry);
  }

  /* The essay grid and its marginal note. */
  res.essays = [...document.querySelectorAll(".essay")].map((essay) => {
    const cs = getComputedStyle(essay);
    const place = (el) => {
      const s = getComputedStyle(el);
      return `${s.gridRowStart}/${s.gridColumnStart}`;
    };
    const note = essay.querySelector(".marginal");
    const body = essay.querySelector(".essay-body");
    const bodyDisplay = getComputedStyle(body).display;
    const leaves = bodyDisplay === "contents" ? [...body.querySelectorAll("[data-prose-leaf]")] : [body];
    const nr = note.getBoundingClientRect();
    const hits = [...leaves, ...body.querySelectorAll("p")].filter((leaf) =>
      [...leaf.getClientRects()].some((r) => r.left < nr.right && r.right > nr.left && r.top < nr.bottom && r.bottom > nr.top),
    );
    return {
      rows: cs.gridTemplateRows.split(" ").filter(Boolean).length,
      tracks: cs.gridTemplateColumns.split(" ").filter(Boolean).length,
      note: place(note),
      body: bodyDisplay === "contents" ? "contents" : place(body),
      leaves: leaves.map(place).join(" "),
      noteBox: `${Math.round(nr.left)}–${Math.round(nr.right)} × ${Math.round(nr.top)}–${Math.round(nr.bottom)}`,
      zeroed: leaves.filter((l) => l.getBoundingClientRect().width === 0).length,
      overlaps: hits.length,
    };
  });

  const foot = document.querySelector(".colophon-foot");
  res.copyright = foot ? foot.textContent : "";
  res.images = [...document.images].map((i) => ({ src: new URL(i.currentSrc || i.src).pathname, ok: i.naturalWidth > 0 }));
  return res;
}

const browser = await chromium.launch();
const pathsSeen = new Set();
const idsByRoute = new Map();
const anchorRefs = [];
const worst = { ratio: Infinity };
const byToken = {};
const lineRanges = {};
const weights = {};
const THRESHOLD = { "#14181c": 12, "#f2f1ed": 12, "#4a5158": 6.5, "#6e2639": 6.5, "#d9a3b1": 6.5 };
let columnEvidence = null;
const kinds = {};
const essayRows = {};

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  head(`${width}px`);
  line("  route                                   status  err  scrollW/clientW  cols  lines(min–max)  rows");

  for (const route of ROUTES) {
    const errors = [];
    const onConsole = (m) => m.type() === "error" && errors.push(m.text());
    const onError = (e) => errors.push(String(e));
    page.on("console", onConsole);
    page.on("pageerror", onError);

    const response = await page.goto(`${ORIGIN}${BASE}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const img of document.images) img.loading = "eager";
      await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
    });
    const status = response.status();
    const data = await page.evaluate(audit);
    page.off("console", onConsole);
    page.off("pageerror", onError);

    const expected = EXPECTED_STATUS(route);
    if (status !== expected) fail(`${route} @${width}: status ${status}, expected ${expected}`);
    // The 404 page's own request 404s by design; that console line is the status, not an error.
    const realErrors = errors.filter((e) => !(route === MISSING && /404/.test(e)));
    if (realErrors.length) fail(`${route} @${width}: ${realErrors.length} console error(s): ${realErrors[0]}`);
    if (data.scroll.sw > data.scroll.cw) fail(`${route} @${width}: horizontal scroll ${data.scroll.sw} > ${data.scroll.cw}`);
    if (data.tables) fail(`${route}: ${data.tables} <table>`);
    if (data.spacing.length) fail(`${route} @${width}: letter-spacing on Persian: ${data.spacing[0]}`);
    if (data.bareLinks.length) fail(`${route} @${width}: link without underline: ${data.bareLinks[0]}`);

    for (const [fg, c] of Object.entries(data.contrast)) {
      if (!byToken[fg] || c.ratio < byToken[fg].ratio) byToken[fg] = { ...c, route, width };
      if (c.ratio < worst.ratio) Object.assign(worst, c, { fg, route, width });
      const min = THRESHOLD[fg];
      if (min === undefined) fail(`${route} @${width}: text colour ${fg} is not a measured token (${c.el})`);
      else if (c.ratio < min) fail(`${route} @${width}: ${fg} on ${c.on} = ${c.ratio.toFixed(2)} < ${min} (${c.el})`);
    }

    const cols = [];
    let lmin = Infinity;
    let lmax = -Infinity;
    for (const p of data.prose) {
      cols.push(p.columns);
      if (p.aligns.some((a) => !["start", "right"].includes(a))) fail(`${route} @${width}: text-align ${p.aligns.join("/")} on ${p.kind}`);
      /* Two-column blocks must resolve to 1 below 900px and 2 above it; the
         one-column blocks must never resolve to more than one. */
      const twoColumn = ["statement", "essay"].includes(p.kind);
      const want = twoColumn ? (width < 900 ? "1" : "2") : null;
      if (want && p.columns !== want) fail(`${route} @${width}: ${p.kind} column-count ${p.columns}, want ${want}`);
      if (!want && !["1", "auto"].includes(p.columns)) fail(`${route} @${width}: ${p.kind} column-count ${p.columns}, want one column`);
      kinds[`${width} ${p.kind}`] ??= { min: Infinity, max: -Infinity, columns: new Set() };
      kinds[`${width} ${p.kind}`].columns.add(p.columns);
      if (p.min !== null) {
        kinds[`${width} ${p.kind}`].min = Math.min(kinds[`${width} ${p.kind}`].min, p.min);
        kinds[`${width} ${p.kind}`].max = Math.max(kinds[`${width} ${p.kind}`].max, p.max);
      }
      if (p.min !== null) {
        lmin = Math.min(lmin, p.min);
        lmax = Math.max(lmax, p.max);
        const key = `${width}`;
        lineRanges[key] ??= { min: Infinity, max: -Infinity, lines: 0, short: 0, medMin: Infinity, medMax: -Infinity };
        lineRanges[key].min = Math.min(lineRanges[key].min, p.min);
        lineRanges[key].max = Math.max(lineRanges[key].max, p.max);
        lineRanges[key].lines += p.lines;
        lineRanges[key].short += p.short;
        lineRanges[key].medMin = Math.min(lineRanges[key].medMin, p.median);
        lineRanges[key].medMax = Math.max(lineRanges[key].medMax, p.median);
        /* The measure is the median; a single short line is the ragged edge of
           unjustified text — the next word did not fit — and §9 forbids the
           justification that would remove it. So: the median must sit in
           45–75, no line may exceed 75, and no line may fall below 35. Lines
           of 35–44 are counted and printed, not hidden. */
        if (p.median < 45 || p.median > 75) fail(`${route} @${width}: ${p.kind} median line ${p.median} chars, outside 45–75`);
        if (p.long) fail(`${route} @${width}: ${p.kind} has ${p.long} line(s) over 75 chars (max ${p.max})`);
        if (p.min < 35) fail(`${route} @${width}: ${p.kind} has a ${p.min}-char line`);
      }
      if (p.direction) {
        if (!(p.direction.second !== null && p.direction.first > p.direction.second)) {
          fail(`${route} @${width}: column direction ${p.direction.first} vs ${p.direction.second}`);
        }
        if (!columnEvidence && width === 1440) columnEvidence = { route, kind: p.kind, ...p.direction };
      }
      for (const s of p.subheads ?? []) {
        if (s.fragments !== 1) fail(`${route} @${width}: a subhead spans a column boundary`);
        if (!s.sameColumn) fail(`${route} @${width}: a subhead is stranded at a column foot`);
      }
    }

    for (const e of data.essays) {
      essayRows[width] ??= new Set();
      essayRows[width].add(`rows ${e.rows} · tracks ${e.tracks} · note ${e.note} · body ${e.body} · leaves ${e.leaves}`);
      if (e.overlaps) fail(`${route} @${width}: marginal note overlaps ${e.overlaps} prose box(es)`);
      if (e.zeroed) fail(`${route} @${width}: ${e.zeroed} zero-width leaf measured`);
      const wantRows = width < 900 ? 4 : width < 1200 ? 2 : 1;
      if (e.rows !== wantRows) fail(`${route} @${width}: essay has ${e.rows} rows, want ${wantRows}`);
    }

    if (!/۲۰۲۶/.test(data.copyright) || /٬/.test(data.copyright)) fail(`${route}: copyright year renders as «${data.copyright.slice(0, 12)}»`);
    for (const img of data.images) if (!img.ok) fail(`${route} @${width}: broken image ${img.src}`);

    if (width === WIDTHS[0]) {
      idsByRoute.set(route, new Set(data.ids));
      for (const l of data.links) {
        pathsSeen.add(l.path);
        if (l.hash) anchorRefs.push({ from: route, ...l });
      }
      const html = (await response.body()).length;
      const imgBytes = [...new Set(data.images.map((i) => i.src))]
        .map((src) => join(out, src.replace(BASE, "")))
        .reduce((sum, f) => sum + (existsSync(f) ? statSync(f).size : 0), 0);
      weights[route] = { html, img: imgBytes };
    }

    const rows = data.essays.map((e) => e.rows).join(",") || "–";
    const range = lmin === Infinity ? "–" : `${lmin}–${lmax}`;
    line(
      `  ${route.padEnd(40)} ${String(status).padStart(4)}  ${String(realErrors.length).padStart(3)}  ${`${data.scroll.sw}/${data.scroll.cw}`.padStart(15)}  ${[...new Set(cols)].join(",").padStart(4) || "   –"}  ${range.padStart(14)}  ${rows.padStart(4)}`,
    );
  }
  await context.close();
}

/* ---- Every internal anchor resolves, and every linked path exists --------- */

head("ANCHORS AND PATHS");
let broken = 0;
const routeOf = (path) => {
  const p = path.startsWith(BASE) ? path.slice(BASE.length) || "/" : path;
  return p;
};
for (const ref of anchorRefs) {
  const route = routeOf(ref.path);
  const ids = idsByRoute.get(route);
  if (!ids || !ids.has(ref.hash)) {
    broken += 1;
    fail(`anchor ${route}#${ref.hash} (from ${ref.from}) does not resolve`);
  }
}
const marks = anchorRefs.filter((r) => r.hash.startsWith("note-")).length;
const backs = anchorRefs.filter((r) => r.hash.startsWith("ref-")).length;
line(`  fragment links checked: ${anchorRefs.length} — reference marks ${marks}, return links ${backs}, broken ${broken}`);
let unreachable = 0;
for (const path of pathsSeen) {
  const route = routeOf(path);
  if (!idsByRoute.has(route)) {
    const r = await fetch(`${ORIGIN}${path}`);
    if (!r.ok) {
      unreachable += 1;
      fail(`linked path ${path} → ${r.status}`);
    }
  }
}
line(`  internal paths linked: ${pathsSeen.size}, unreachable ${unreachable}`);

/* ---- Focus rings, per ground ---------------------------------------------- */

head("FOCUS RING CONTRAST — keyboard Tab through three routes at 1440px");
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const rings = {};
  for (const route of ["/", `/practice/${slugs[0]}/`, "/notes/"]) {
    await page.goto(`${ORIGIN}${BASE}${route}`, { waitUntil: "networkidle" });
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press("Tab");
      const r = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const parse = (s) => {
          const m = s.match(/rgba?\(([^)]+)\)/);
          const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
          return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
        };
        let bg = null;
        for (let n = el.parentElement; n; n = n.parentElement) {
          const c = parse(getComputedStyle(n).backgroundColor);
          if (c.a >= 1) {
            bg = c;
            break;
          }
        }
        const lum = ({ r, g, b }) => {
          const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const ring = parse(cs.outlineColor);
        const [x, y] = [lum(ring), lum(bg)].sort((p, q) => q - p);
        const hex = ({ r, g, b }) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
        return {
          id: el.id || el.getAttribute("href"),
          style: cs.outlineStyle,
          width: cs.outlineWidth,
          ground: hex(bg),
          ratio: (x + 0.05) / (y + 0.05),
        };
      });
      if (!r) break;
      if (r.style === "none" || r.width === "0px") fail(`${route}: focused ${r.id} shows no outline`);
      if (!rings[r.ground] || r.ratio < rings[r.ground].ratio) rings[r.ground] = r;
    }
  }
  const names = { "#faf9f6": "--paper", "#f0eee7": "--paper-tint", "#181f26": "--furniture" };
  for (const [ground, r] of Object.entries(rings)) {
    line(`  ${(names[ground] ?? ground).padEnd(14)} worst ring ${r.ratio.toFixed(2)}  (${r.style} ${r.width})`);
    if (r.ratio < 3) fail(`focus ring ${r.ratio.toFixed(2)} on ${ground}`);
  }
  /* No control sits on --paper-tint, so the ring is measured from the
     tokens instead: the ring colour there would be --focus (#6e2639). */
  for (const g of Object.keys(names)) {
    if (rings[g]) continue;
    const lum = (h) =>
      [1, 3, 5]
        .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
        .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const [x, y] = [lum("#6e2639"), lum(g)].sort((p, q) => q - p);
    const r = (x + 0.05) / (y + 0.05);
    line(`  ${names[g].padEnd(14)} ${r.toFixed(2)} from tokens — no focusable element sits on this ground`);
    if (r < 3) fail(`focus ring ${r.toFixed(2)} on ${g}`);
  }
  await context.close();
}

/* ---- Runtime glyph check — which font actually rendered each glyph -------- */

head("GLYPHS AT RUNTIME — CSS.getPlatformFontsForNode, per glyph, per face");
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}${BASE}/`, { waitUntil: "networkidle" });
  const families = await page.evaluate(async () => {
    const box = document.createElement("div");
    const chars = [..."پچژگکیه۰۱۲۳۴۵۶۷۸۹", "ه‌ها"];
    for (const [face, variable] of [
      ["display", "var(--font-display)"],
      ["body", "var(--font-body)"],
    ]) {
      chars.forEach((ch, i) => {
        const s = document.createElement("span");
        s.id = `glyph-${face}-${i}`;
        s.style.fontFamily = variable;
        s.textContent = ch;
        box.append(s);
      });
    }
    document.body.append(box);
    await document.fonts.ready;
    return {
      display: getComputedStyle(document.querySelector(".opener-numeral, .nameplate-mark")).fontFamily,
      body: getComputedStyle(document.body).fontFamily,
      chars,
    };
  });
  line(`  display resolves to: ${families.display}`);
  line(`  body resolves to:    ${families.body}`);
  const cdp = await context.newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root: doc } = await cdp.send("DOM.getDocument", { depth: -1 });
  for (const face of ["display", "body"]) {
    const used = new Map();
    const missing = [];
    for (let i = 0; i < families.chars.length; i++) {
      const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: doc.nodeId, selector: `#glyph-${face}-${i}` });
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      for (const f of fonts) used.set(`${f.familyName}${f.isCustomFont ? " (web)" : " (SYSTEM)"}`, true);
      if (fonts.some((f) => !f.isCustomFont)) missing.push(families.chars[i]);
    }
    line(`  ${face.padEnd(8)} rendered by: ${[...used.keys()].join(", ")}${missing.length ? `   FALLBACK for ${missing.join(" ")}` : ""}`);
    if (missing.length) fail(`${face} face fell back to a system font for ${missing.join(" ")}`);
  }
  await context.close();
}

/* ---- Reduced motion ------------------------------------------------------- */

head("PREFERS-REDUCED-MOTION: REDUCE");
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  let hidden = 0;
  for (const route of ROUTES) {
    await page.goto(`${ORIGIN}${BASE}${route}`, { waitUntil: "networkidle" });
    hidden += await page.evaluate(
      () =>
        [...document.querySelectorAll("main *, header *, footer *")].filter((el) => {
          const cs = getComputedStyle(el);
          return Number(cs.opacity) === 0 || (cs.transform !== "none" && !el.classList.contains("skip-link"));
        }).length,
    );
  }
  line(`  elements with zero opacity or a transform, across all routes: ${hidden}`);
  if (hidden) fail(`${hidden} element(s) hidden or transformed under reduced motion`);
  await context.close();
}

await browser.close();
stop();

/* ========================================================================== */
/*  Summary                                                                   */
/* ========================================================================== */

head("CONTRAST — worst measured per text colour, all routes, all widths");
const TOKEN = { "#14181c": "--ink", "#4a5158": "--ink-soft", "#6e2639": "--oxblood", "#f2f1ed": "--paper-inv", "#d9a3b1": "--oxblood-soft" };
for (const [fg, c] of Object.entries(byToken).sort((a, b) => a[1].ratio - b[1].ratio)) {
  line(`  ${(TOKEN[fg] ?? fg).padEnd(15)} ${c.ratio.toFixed(2).padStart(6)} on ${c.on}  (${c.el}, ${c.route} @${c.width})`);
}
line(`  worst overall: ${worst.ratio.toFixed(2)} — ${TOKEN[worst.fg] ?? worst.fg} on ${worst.on}, ${worst.el} «${worst.text}»`);

head("LINE LENGTH — characters per full line, every prose block");
for (const [w, r] of Object.entries(lineRanges)) {
  line(`  ${w.padStart(5)}px  median ${r.medMin}–${r.medMax} per block · range ${r.min}–${r.max} · ${r.lines} lines · ${r.short} ragged lines under 45`);
}

head("LINE LENGTH BY BLOCK — chars per full line, and resolved column-count");
for (const [k, r] of Object.entries(kinds)) {
  line(`  ${k.padEnd(18)} ${r.min === Infinity ? "–" : `${r.min}–${r.max}`}   column-count ${[...r.columns].join("/")}`);
}

head("COLUMN DIRECTION — first line's right edge, column one vs column two");
if (columnEvidence) {
  line(`  ${columnEvidence.route} (${columnEvidence.kind}) at 1440px: ${columnEvidence.first} > ${columnEvidence.second}`);
} else fail("no two-column block measured at 1440px");

head("MARGINAL NOTE GRID — resolved row/column (row/col), per width");
for (const [w, set] of Object.entries(essayRows)) for (const s of set) line(`  ${w.padStart(5)}px  ${s}`);

head("WEIGHT — per route");
for (const [route, w] of Object.entries(weights)) {
  line(`  ${route.padEnd(40)} html ${(w.html / 1024).toFixed(1).padStart(6)} KB   images ${(w.img / 1024).toFixed(0).padStart(4)} KB`);
}

head(failures.length ? `FAILED — ${failures.length}` : "ALL CHECKS PASSED");
for (const f of failures.slice(0, 60)) line(`  ✗ ${f}`);
if (failures.length > 60) line(`  … and ${failures.length - 60} more`);
process.exit(failures.length ? 1 : 0);
