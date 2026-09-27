/**
 * Open Graph card generator — DADAVAR.
 *
 * No social crawler renders an SVG `og:image`, so the share card is a raster.
 * It is drawn here with Node's own `zlib` rather than an image library: the
 * project has exactly three runtime dependencies, and a flat card is not worth
 * a fourth.
 *
 * The card is the masthead's ground — `--furniture`, flat, no gradient — with
 * the square-kufic dal from `src/app/icon.svg` at its centre and one oxblood
 * rule beneath it, inside a hairline frame. It carries no type: rendering
 * Persian into a generated raster needs a shaping pipeline this project does
 * not have, and a Latin-only card for a Persian firm would read worse than the
 * mark alone.
 *
 *   node scripts/generate-og.mjs
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "media");
mkdirSync(outDir, { recursive: true });

/** Open Graph's expected card size. 1.91:1, which is what every consumer crops to. */
const W = 1200;
const H = 630;

/** Kept in sync with src/app/tokens.css. */
const FURNITURE = [0x18, 0x1f, 0x26];
const PAPER_INV = [0xf2, 0xf1, 0xed];
const OXBLOOD_SOFT = [0xd9, 0xa3, 0xb1];

/* -------------------------------------------------------------------------- */
/*  PNG encoding                                                              */
/* -------------------------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

/**
 * Truecolour 8-bit PNG from a raw RGB buffer.
 *
 * Every scanline uses filter type 1 (Sub — each byte minus the one three to its
 * left). On a smooth horizontal gradient that leaves a run of near-zeroes, so
 * deflate turns a 2.2 MB raw image into tens of kilobytes. Filter 0 on the same
 * data is several times larger.
 */
function encodePng(width, height, rgb) {
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y++) {
    const src = y * stride;
    const dst = y * (stride + 1);
    raw[dst] = 1;
    for (let x = 0; x < stride; x++) {
      const left = x >= 3 ? rgb[src + x - 3] : 0;
      raw[dst + 1 + x] = (rgb[src + x] - left) & 0xff;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  // 10–12: compression, filter and interlace methods — all 0, the only values
  // the format defines.

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* -------------------------------------------------------------------------- */
/*  The card                                                                  */
/* -------------------------------------------------------------------------- */

const mix = (a, b, t) => a + (b - a) * t;

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
const SCALE = 10;
const ORIGIN_X = W / 2 - 16 * SCALE;
const ORIGIN_Y = H / 2 - 17.5 * SCALE;

/** The colour of one sample point, in card pixels. */
function sample(x, y) {
  const u = (x - ORIGIN_X) / SCALE;
  const v = (y - ORIGIN_Y) / SCALE;
  for (const r of MARK) {
    if (u >= r.x0 && u < r.x1 && v >= r.y0 && v < r.y1) return r.colour;
  }
  // The hairline frame, 40px in: --rule-inv, paper at 18% on the ground.
  const inset = 40;
  const onFrame =
    (x >= inset && x < inset + 1 && y >= inset && y < H - inset) ||
    (x >= W - inset - 1 && x < W - inset && y >= inset && y < H - inset) ||
    (y >= inset && y < inset + 1 && x >= inset && x < W - inset) ||
    (y >= H - inset - 1 && y < H - inset && x >= inset && x < W - inset);
  if (onFrame) return FURNITURE.map((c, i) => mix(c, PAPER_INV[i], 0.18));
  return FURNITURE;
}

// 4×4 supersampling, so the mark's edges are antialiased and nothing else is
// needed: the ground is flat, and a flat ground compresses to almost nothing.
const N = 4;
const rgb = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let r = 0;
    let g = 0;
    let b = 0;
    for (let sy = 0; sy < N; sy++) {
      for (let sx = 0; sx < N; sx++) {
        const c = sample(x + (sx + 0.5) / N, y + (sy + 0.5) / N);
        r += c[0];
        g += c[1];
        b += c[2];
      }
    }
    const o = (y * W + x) * 3;
    rgb[o] = Math.round(r / (N * N));
    rgb[o + 1] = Math.round(g / (N * N));
    rgb[o + 2] = Math.round(b / (N * N));
  }
}

const file = join(outDir, "og-card.png");
const png = encodePng(W, H, rgb);
writeFileSync(file, png);
console.log(`generated og-card.png  ${W}×${H}  ${(png.length / 1024).toFixed(0)} KB → public/media/`);
