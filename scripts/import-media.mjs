/**
 * Phase B — bring the real photographs in over the placeholders.
 *
 *   node scripts/import-media.mjs "C:/path/to/the/folder"
 *
 * The photographs arrive as large PNGs at whatever size the image model chose.
 * The site needs JPEGs at exact pixel sizes, small enough that a route carrying
 * nine of them stays inside its image budget. This script does that conversion
 * and nothing else: it never crops, never changes an aspect ratio, and never
 * renames a file. `o-01.png` becomes `o-01.jpg` and lands at the path the
 * content already points at.
 *
 * ── WHY IT LOOKS LIKE THIS ─────────────────────────────────────────────────
 *
 * Node has no image codec and this project has exactly three runtime
 * dependencies, so there is nothing here to decode a PNG or write a JPEG. The
 * work happens on a canvas inside the Chromium that Playwright already installs
 * for the smoke suite — same trick as `generate-media.mjs`, same reason.
 *
 * Quality is not fixed. Each file is encoded at descending quality until it
 * fits the byte budget, and the quality it settled on is printed. A frame full
 * of fine grain needs a lower number than a frame that is mostly shadow, and
 * guessing one quality for every file either bloats the light frames or
 * ruins the busy ones.
 *
 * ── THE SIZE MISMATCH IS HANDLED, THE RATIO MISMATCH IS REFUSED ────────────
 *
 * A file at the right ratio but the wrong size is rescaled, which is lossless
 * in the ways that matter here. A file at the WRONG RATIO is refused rather
 * than squashed or silently cropped, because either choice changes the framing
 * the photograph was composed at and neither is mine to make.
 *
 * ── DADAVAR ────────────────────────────────────────────────────────────────
 *
 * Copied from SHABANEH. The source is ChatGPT Work's folder
 * (`Desktop/for gpt work/01-DADAVAR/`), read-only. ChatGPT returns the four
 * landscapes at exactly 1536x1024 and the two squares at 1254x1254; the squares
 * are rescaled here to 1024x1024, which is a rescale only, because the ratio is
 * exact. Any ratio difference over 0.01 is refused, and so is any source smaller
 * than its target: upscaling would invent detail the photograph never had. Six
 * slots, one image per route at most, so the per-route budget is measured on
 * the built export rather than here.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "media");

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('usage: node scripts/import-media.mjs "C:/path/to/folder" [max-KB]');
  process.exit(2);
}

/**
 * The byte ceiling per file, in KB, second argument, default 200.
 *
 * It is a knob rather than a constant because the number that matters is not
 * per-file, it is per-route: in SHABANEH the menu route carries nine dishes and is
 * checked against a 2.5 MB image budget. At a 300 KB ceiling those nine came to
 * 2.42 MB — passing, with three percent of headroom, which is not headroom. At
 * 200 KB they come to roughly 1.8 MB and the quality lands near 0.8, which on
 * dark grainy photographs at this display size is not a visible downgrade. The
 * source files are untouched, so re-running at a different ceiling costs one
 * command and loses nothing.
 */
const MAX_BYTES = Number(process.argv[3] ?? 200) * 1024;

/** What each slot is shot at: 3:2 for the four interiors, 1:1 for the two
 *  desk details. Kept in step with src/content/media.ts. */
const target = (base) => (base.startsWith("d-") ? { w: 1024, h: 1024 } : { w: 1536, h: 1024 });

/** The six names the content actually references. A file outside this
 *  list is skipped loudly rather than copied in: a stray image in the folder is
 *  far more likely to be a duplicate or a reject than a new requirement. */
const EXPECTED = ["o-01", "o-02", "o-03", "o-04", "d-01", "d-02"];

const found = new Map();
for (const f of readdirSync(srcDir)) {
  const m = /^(.+)\.(png|jpe?g|webp)$/i.exec(f);
  if (!m) continue;
  const base = m[1];
  if (!EXPECTED.includes(base)) {
    console.log(`  skip   ${f} — not one of the ${EXPECTED.length} names`);
    continue;
  }
  if (found.has(base)) {
    console.log(`  skip   ${f} — ${found.get(base)} already claimed ${base}`);
    continue;
  }
  found.set(base, f);
}

const missing = EXPECTED.filter((b) => !found.has(b));

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("about:blank");

/**
 * Decode, rescale and encode, all in the page.
 *
 * `imageSmoothingQuality = "high"` matters: the default box filter on a
 * 1254 -> 1024 downscale leaves visible stair-stepping on the plate rim, which
 * is exactly the kind of artefact that reads as "cheap stock photo" at the size
 * these are displayed.
 */
async function convert(dataUrl, want) {
  return page.evaluate(
    async ({ dataUrl, want, MAX_BYTES }) => {
      const blob = await (await fetch(dataUrl)).blob();
      const bitmap = await createImageBitmap(blob);

      const ratioIn = bitmap.width / bitmap.height;
      const ratioOut = want.w / want.h;
      if (Math.abs(ratioIn - ratioOut) > 0.01) {
        return { error: `aspect ratio ${ratioIn.toFixed(3)} but ${ratioOut.toFixed(3)} expected`, w: bitmap.width, h: bitmap.height };
      }
      if (bitmap.width < want.w || bitmap.height < want.h) {
        return { error: `smaller than the ${want.w}x${want.h} target — no upscaling`, w: bitmap.width, h: bitmap.height };
      }

      const canvas = document.createElement("canvas");
      canvas.width = want.w;
      canvas.height = want.h;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, want.w, want.h);

      /* Walk quality down until it fits. Stops at 0.55: below that the grain
         these were shot with turns into blocking, and a file that still will
         not fit by then is a problem to look at, not to crush further. */
      for (let q = 0.9; q >= 0.55; q -= 0.04) {
        const url = canvas.toDataURL("image/jpeg", q);
        const bytes = Math.floor((url.length - url.indexOf(",") - 1) * 0.75);
        if (bytes <= MAX_BYTES || q < 0.59) {
          return { url, q: Number(q.toFixed(2)), inW: bitmap.width, inH: bitmap.height };
        }
      }
      return { error: "could not reach the byte budget above quality 0.55" };
    },
    { dataUrl, want, MAX_BYTES },
  );
}

/** Width and height straight out of a JPEG's SOF marker — proof the file on
 *  disk is the size intended, not the size the script meant to write. */
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return { w: 0, h: 0 };
}

const problems = [];
let total = 0;
const rows = [];

for (const base of EXPECTED) {
  const file = found.get(base);
  if (!file) continue;

  const want = target(base);
  const src = readFileSync(join(srcDir, file));
  const ext = file.slice(file.lastIndexOf(".") + 1).toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const result = await convert(`data:${mime};base64,${src.toString("base64")}`, want);

  if (result.error) {
    problems.push(`${file} — ${result.error}${result.w ? ` (source ${result.w}x${result.h})` : ""}`);
    console.log(`  FAIL   ${file} — ${result.error}`);
    continue;
  }

  const bytes = Buffer.from(result.url.split(",")[1], "base64");
  const dest = join(outDir, `${base}.jpg`);
  writeFileSync(dest, bytes);
  total += bytes.length;

  const onDisk = jpegSize(bytes);
  const sizeOk = onDisk.w === want.w && onDisk.h === want.h;
  const budgetOk = bytes.length <= MAX_BYTES;
  if (!sizeOk) problems.push(`${base}.jpg — written at ${onDisk.w}x${onDisk.h}, expected ${want.w}x${want.h}`);
  if (!budgetOk) problems.push(`${base}.jpg — ${(bytes.length / 1024).toFixed(0)} KB, over the ${MAX_BYTES / 1024} KB ceiling`);

  rows.push(
    `  ${sizeOk && budgetOk ? "ok  " : "FAIL"}   ${base}.jpg  ` +
      `${result.inW}x${result.inH} → ${onDisk.w}x${onDisk.h}  ` +
      `${(src.length / 1024 / 1024).toFixed(2)} MB → ${(bytes.length / 1024).toFixed(0)} KB  q${result.q}`,
  );
}

await browser.close();

console.log(rows.join("\n"));

console.log(
  `\n${rows.length} of ${EXPECTED.length} imported → public/media/  ` +
    `(${(total / 1024 / 1024).toFixed(2)} MB total, ${(total / Math.max(1, rows.length) / 1024).toFixed(0)} KB average)`,
);

if (missing.length) {
  console.log(`\nnot in the source folder: ${missing.join(", ")}`);
  problems.push(`${missing.length} of the ${EXPECTED.length} names had no file: ${missing.join(", ")}`);
}

console.log("\n" + "─".repeat(78));
if (problems.length) {
  console.log(`${problems.length} PROBLEM(S)`);
  for (const p of problems) console.log(`  - ${p}`);
  console.log("─".repeat(78));
  process.exit(1);
}
console.log(`CLEAN — ${EXPECTED.length} photographs in place at the right size and weight`);
console.log("─".repeat(78));
console.log(
  "\nNOTE: generate-media.mjs writes placeholders to these same paths and will\n" +
    "overwrite every one of them. Do not run it again unless that is what you want.",
);
