/**
 * Open Graph card generator — DADAVAR.
 *
 * No social crawler renders an SVG `og:image`, so the share card is a raster:
 * `public/media/og-card.jpg`, 1200×630, at most 200 KB.
 *
 * The left half is a photograph — `o-01.jpg`, the meeting room that opens the
 * home page's method band — filling a full-height 600×630 panel, cropped to
 * cover from its centre. The right half is the card as it was before the
 * photographs existed: the masthead's ground, `--furniture`, flat, with the
 * square-kufic dal from `src/app/icon.svg` and one oxblood rule beneath it,
 * inside a hairline frame, all re-centred in that half at the same scale.
 * **Nothing is drawn over the photograph**, so no contrast pair depends on its
 * pixels. The card carries no type: rendering Persian into a generated raster
 * needs a shaping pipeline this project does not have, and a Latin-only card
 * for a Persian firm would read worse than the mark alone.
 *
 * ── WHY CHROMIUM ───────────────────────────────────────────────────────────
 * The first card was drawn with a hand-written PNG encoder in plain Node. Node
 * cannot decode a JPEG, and the project has exactly three runtime dependencies,
 * so the card is now composed on a canvas inside the Chromium that Playwright
 * already installs for the smoke suite — the same route as `import-media.mjs`.
 * Quality is walked down from 0.9 until the file fits 200 KB.
 *
 * After writing, the script decodes its own output and measures it: the pixel
 * size, the ground colour of the right half against `--furniture`, and the
 * contrast of the mark and the rule against that ground, from pixels.
 *
 *   node scripts/generate-og.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const mediaDir = join(here, "..", "public", "media");

/** Open Graph's expected card size. 1.91:1, which is what every consumer crops to. */
const W = 1200;
const H = 630;
/** The photograph's panel: the left half, full height. */
const PANEL = { x: 0, y: 0, w: 600, h: 630 };
/** The half that keeps the old card. */
const HALF = { x: 600, y: 0, w: 600, h: 630 };
const PHOTO = "o-01.jpg";
const MAX_BYTES = 200 * 1024;

/** Kept in sync with src/app/tokens.css. */
const FURNITURE = [0x18, 0x1f, 0x26];
const PAPER_INV = [0xf2, 0xf1, 0xed];
const OXBLOOD_SOFT = [0xd9, 0xa3, 0xb1];

/** The hairline frame: --rule-inv, paper at 18% on the ground, 40px in. */
const FRAME_INSET = 40;
const FRAME = FURNITURE.map((c, i) => Math.round(c + (PAPER_INV[i] - c) * 0.18));

/**
 * The mark as rectangles in icon.svg's 32-unit box. The dal's path there,
 * `M19 7h4v18H9v-7h4v3h6z`, is exactly the union of the first three.
 */
const MARK = [
  { x0: 19, y0: 7, x1: 23, y1: 25, colour: PAPER_INV },
  { x0: 9, y0: 21, x1: 23, y1: 25, colour: PAPER_INV },
  { x0: 9, y0: 18, x1: 13, y1: 25, colour: PAPER_INV },
  { x0: 9, y0: 27, x1: 23, y1: 28, colour: OXBLOOD_SOFT },
];
/** Same scale as the first card: the mark is 140×210px and fits the half as is. */
const SCALE = 10;
const ORIGIN_X = HALF.x + HALF.w / 2 - 16 * SCALE;
const ORIGIN_Y = HALF.y + HALF.h / 2 - 17.5 * SCALE;

/** Sample points, in card pixels, for the self-measurement. Ground points sit
 *  clear of the mark, the frame, and the 16px chroma block that straddles the
 *  photograph's edge at x = 600. */
const PROBES = {
  ground: [[700, 100], [1100, 100], [700, 530], [1100, 530], [900, 80], [1180, 20]],
  mark: [ORIGIN_X + 21 * SCALE, ORIGIN_Y + 15 * SCALE],
  rule: [ORIGIN_X + 16 * SCALE, ORIGIN_Y + 27.5 * SCALE],
};

const photo = readFileSync(join(mediaDir, PHOTO));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("about:blank");

const out = await page.evaluate(
  async ({ photoUrl, W, H, PANEL, HALF, FRAME_INSET, FRAME, FURNITURE, MARK, SCALE, ORIGIN_X, ORIGIN_Y, MAX_BYTES, PROBES }) => {
    const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    const bitmap = await createImageBitmap(await (await fetch(photoUrl)).blob());

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Photograph: cover the panel, cropped from the centre.
    const s = Math.max(PANEL.w / bitmap.width, PANEL.h / bitmap.height);
    const sw = PANEL.w / s;
    const sh = PANEL.h / s;
    const sx = (bitmap.width - sw) / 2;
    const sy = (bitmap.height - sh) / 2;
    ctx.drawImage(bitmap, sx, sy, sw, sh, PANEL.x, PANEL.y, PANEL.w, PANEL.h);

    // The old card, in the right half. Every edge lands on a whole pixel, so
    // nothing here needs antialiasing.
    ctx.fillStyle = rgb(FURNITURE);
    ctx.fillRect(HALF.x, HALF.y, HALF.w, HALF.h);
    ctx.fillStyle = rgb(FRAME);
    const fx0 = HALF.x + FRAME_INSET;
    const fy0 = HALF.y + FRAME_INSET;
    const fx1 = HALF.x + HALF.w - FRAME_INSET;
    const fy1 = HALF.y + HALF.h - FRAME_INSET;
    ctx.fillRect(fx0, fy0, 1, fy1 - fy0);
    ctx.fillRect(fx1 - 1, fy0, 1, fy1 - fy0);
    ctx.fillRect(fx0, fy0, fx1 - fx0, 1);
    ctx.fillRect(fx0, fy1 - 1, fx1 - fx0, 1);
    for (const r of MARK) {
      ctx.fillStyle = rgb(r.colour);
      ctx.fillRect(ORIGIN_X + r.x0 * SCALE, ORIGIN_Y + r.y0 * SCALE, (r.x1 - r.x0) * SCALE, (r.y1 - r.y0) * SCALE);
    }

    let url = "";
    let q = 0.9;
    for (; q >= 0.55; q -= 0.04) {
      url = canvas.toDataURL("image/jpeg", q);
      if (Math.floor((url.length - url.indexOf(",") - 1) * 0.75) <= MAX_BYTES) break;
    }

    // Measure the encoded file, not the canvas: decode it again and read pixels.
    const back = await createImageBitmap(await (await fetch(url)).blob());
    const c2 = document.createElement("canvas");
    c2.width = back.width;
    c2.height = back.height;
    const x2 = c2.getContext("2d");
    x2.drawImage(back, 0, 0);
    const px = ([x, y]) => Array.from(x2.getImageData(x, y, 1, 1).data.slice(0, 3));
    return {
      url,
      q: Number(q.toFixed(2)),
      crop: { sx: Math.round(sx), sy: Math.round(sy), sw: Math.round(sw), sh: Math.round(sh), src: `${bitmap.width}x${bitmap.height}` },
      size: { w: back.width, h: back.height },
      ground: PROBES.ground.map(px),
      mark: px(PROBES.mark),
      rule: px(PROBES.rule),
    };
  },
  {
    photoUrl: `data:image/jpeg;base64,${photo.toString("base64")}`,
    W, H, PANEL, HALF, FRAME_INSET, FRAME, FURNITURE, MARK, SCALE, ORIGIN_X, ORIGIN_Y, MAX_BYTES, PROBES,
  },
);
await browser.close();

const bytes = Buffer.from(out.url.split(",")[1], "base64");
writeFileSync(join(mediaDir, "og-card.jpg"), bytes);

const lum = (c) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (hi + 0.05) / (lo + 0.05);
};
const groundDelta = Math.max(...out.ground.flatMap((g) => g.map((v, i) => Math.abs(v - FURNITURE[i]))));
const ground = out.ground[0];

console.log(`generated og-card.jpg  ${out.size.w}×${out.size.h}  ${bytes.length} B  q${out.q} → public/media/`);
console.log(`photo ${PHOTO} ${out.crop.src}, centre crop ${out.crop.sw}×${out.crop.sh} from x=${out.crop.sx} → ${PANEL.w}×${PANEL.h} panel`);
console.log(`ground ${JSON.stringify(out.ground)}  max channel delta from --furniture ${groundDelta}`);
console.log(`mark ${JSON.stringify(out.mark)} on ground ${ratio(out.mark, ground).toFixed(2)}:1 (tokens ${ratio(PAPER_INV, FURNITURE).toFixed(2)}:1)`);
console.log(`rule ${JSON.stringify(out.rule)} on ground ${ratio(out.rule, ground).toFixed(2)}:1 (tokens ${ratio(OXBLOOD_SOFT, FURNITURE).toFixed(2)}:1)`);

const problems = [];
if (out.size.w !== W || out.size.h !== H) problems.push(`written at ${out.size.w}×${out.size.h}`);
if (bytes.length > MAX_BYTES) problems.push(`${bytes.length} B, over ${MAX_BYTES} B`);
if (groundDelta > 2) problems.push(`ground drifts ${groundDelta} from --furniture`);
if (Math.abs(ratio(out.mark, ground) - ratio(PAPER_INV, FURNITURE)) > 0.1) problems.push("mark contrast moved");
if (Math.abs(ratio(out.rule, ground) - ratio(OXBLOOD_SOFT, FURNITURE)) > 0.1) problems.push("rule contrast moved");
if (problems.length) {
  console.log(`FAIL — ${problems.join("; ")}`);
  process.exit(1);
}
console.log("CLEAN");
