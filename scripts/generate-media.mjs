/**
 * Placeholder plates — DADAVAR.
 *
 * Six slots, and only six: on a reading site an image interrupts the column
 * and has to earn its place. Until the real photographs exist, each slot holds
 * a tonal study of the composition its photograph will have — the same room,
 * table, shelving, stairwell, corridor or desk, drawn as flat planes in paper,
 * stone and dark wood, lit by one window from the upper right (the RTL reading
 * origin). No person, no hand, no silhouette, and no lettering of any kind.
 *
 * ── Why real JPEGs ────────────────────────────────────────────────────────
 * A placeholder sits at **exactly** the path and ratio the real file will use,
 * so Phase B is a file swap with no edit to `src/content/media.ts`. That rules
 * out SVG, and it rules out PNG bytes wearing a `.jpg` name. The encoder is the
 * baseline JPEG encoder from VARAGH, copied unchanged: Annex K quantization and
 * Huffman tables, 4:4:4, no dependency.
 *
 * Polygons are scan-converted at 2× and box-filtered down, which is all the
 * antialiasing a flat-plane study needs. The PRNG is seeded, so a rerun writes
 * byte-identical files.
 *
 *   node scripts/generate-media.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "media");
mkdirSync(outDir, { recursive: true });

/* ========================================================================== */
/*  Baseline JPEG encoder                                                     */
/* ========================================================================== */

const ZIGZAG = [
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27,
  20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58,
  59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63,
];

const Q_LUMA = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113,
  92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];

const Q_CHROMA = [
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99,
  47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
];

/** Annex K code-length counts and symbol lists. */
const HUFF = {
  dcLuma: {
    bits: [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    vals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  dcChroma: {
    bits: [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    vals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  acLuma: {
    bits: [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d],
    vals: [
      0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61,
      0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52,
      0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25,
      0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64,
      0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83,
      0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99,
      0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
      0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3,
      0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8,
      0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa,
    ],
  },
  acChroma: {
    bits: [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77],
    vals: [
      0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61,
      0x71, 0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91, 0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33,
      0x52, 0xf0, 0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25, 0xf1, 0x17, 0x18,
      0x19, 0x1a, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44,
      0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63,
      0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a,
      0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97,
      0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4,
      0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca,
      0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7,
      0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa,
    ],
  },
};

/** symbol -> { code, length }, built the way the spec derives canonical codes. */
function huffTable({ bits, vals }) {
  const table = new Map();
  let code = 0;
  let k = 0;
  for (let length = 1; length <= 16; length++) {
    for (let i = 0; i < bits[length]; i++) {
      table.set(vals[k++], { code, length });
      code++;
    }
    code <<= 1;
  }
  return table;
}

/** Scales a quantization table for a quality in 1..100, the libjpeg rule. */
function scaleQuant(base, quality) {
  const factor = quality < 50 ? 5000 / quality : 200 - quality * 2;
  return base.map((v) => Math.min(255, Math.max(1, Math.round((v * factor + 50) / 100))));
}

/** Separable 8-point float DCT-II, rows then columns. Naive and fast enough. */
const COS = (() => {
  const t = new Float64Array(64);
  for (let u = 0; u < 8; u++) {
    for (let x = 0; x < 8; x++) t[u * 8 + x] = Math.cos(((2 * x + 1) * u * Math.PI) / 16);
  }
  return t;
})();
const ALPHA = (u) => (u === 0 ? Math.SQRT1_2 : 1);

function fdct(block, out) {
  const tmp = new Float64Array(64);
  for (let y = 0; y < 8; y++) {
    for (let u = 0; u < 8; u++) {
      let sum = 0;
      for (let x = 0; x < 8; x++) sum += block[y * 8 + x] * COS[u * 8 + x];
      tmp[y * 8 + u] = 0.5 * ALPHA(u) * sum;
    }
  }
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      let sum = 0;
      for (let y = 0; y < 8; y++) sum += tmp[y * 8 + u] * COS[v * 8 + y];
      out[v * 8 + u] = 0.5 * ALPHA(v) * sum;
    }
  }
}

/** MSB-first bit sink that byte-stuffs 0x00 after every 0xFF, as JPEG requires. */
class BitWriter {
  constructor() {
    this.bytes = [];
    this.acc = 0;
    this.n = 0;
  }
  write(code, length) {
    for (let i = length - 1; i >= 0; i--) {
      this.acc = (this.acc << 1) | ((code >> i) & 1);
      this.n++;
      if (this.n === 8) {
        this.bytes.push(this.acc);
        if (this.acc === 0xff) this.bytes.push(0x00);
        this.acc = 0;
        this.n = 0;
      }
    }
  }
  flush() {
    while (this.n !== 0) this.write(1, 1); // pad with 1s, per the spec
  }
}

/** Category (number of significant bits) and the value's JPEG bit pattern. */
function amplitude(value) {
  const magnitude = Math.abs(value);
  let category = 0;
  while (magnitude >> category) category++;
  return { category, bits: value > 0 ? value : (1 << category) + value - 1 };
}

function encodeJpeg(width, height, rgb, quality = 80) {
  const qy = scaleQuant(Q_LUMA, quality);
  const qc = scaleQuant(Q_CHROMA, quality);
  const tables = {
    dcLuma: huffTable(HUFF.dcLuma),
    dcChroma: huffTable(HUFF.dcChroma),
    acLuma: huffTable(HUFF.acLuma),
    acChroma: huffTable(HUFF.acChroma),
  };

  // Colour transform, full resolution on all three planes (4:4:4).
  const n = width * height;
  const Y = new Float32Array(n);
  const CB = new Float32Array(n);
  const CR = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3];
    const g = rgb[i * 3 + 1];
    const b = rgb[i * 3 + 2];
    Y[i] = 0.299 * r + 0.587 * g + 0.114 * b - 128;
    CB[i] = -0.168736 * r - 0.331264 * g + 0.5 * b;
    CR[i] = 0.5 * r - 0.418688 * g - 0.081312 * b;
  }

  const bw = new BitWriter();
  const block = new Float64Array(64);
  const coeffs = new Float64Array(64);
  const prevDc = [0, 0, 0];

  const planes = [
    { data: Y, q: qy, dc: tables.dcLuma, ac: tables.acLuma },
    { data: CB, q: qc, dc: tables.dcChroma, ac: tables.acChroma },
    { data: CR, q: qc, dc: tables.dcChroma, ac: tables.acChroma },
  ];

  for (let by = 0; by < height; by += 8) {
    for (let bx = 0; bx < width; bx += 8) {
      for (let p = 0; p < 3; p++) {
        const { data, q, dc, ac } = planes[p];

        // Edge replication: a partial block at the right or bottom edge repeats
        // its last real column/row rather than reading past the buffer.
        for (let y = 0; y < 8; y++) {
          const sy = Math.min(by + y, height - 1);
          for (let x = 0; x < 8; x++) {
            const sx = Math.min(bx + x, width - 1);
            block[y * 8 + x] = data[sy * width + sx];
          }
        }

        fdct(block, coeffs);

        const quantized = new Int16Array(64);
        for (let i = 0; i < 64; i++) quantized[i] = Math.round(coeffs[i] / q[i]);

        // DC, differentially coded against the previous block of this plane.
        const diff = quantized[0] - prevDc[p];
        prevDc[p] = quantized[0];
        if (diff === 0) {
          const e = dc.get(0);
          bw.write(e.code, e.length);
        } else {
          const { category, bits } = amplitude(diff);
          const e = dc.get(category);
          bw.write(e.code, e.length);
          bw.write(bits, category);
        }

        // AC, zigzag order, run-length over zeros.
        let lastNonZero = 0;
        for (let i = 63; i > 0; i--) {
          if (quantized[ZIGZAG[i]] !== 0) {
            lastNonZero = i;
            break;
          }
        }
        let run = 0;
        for (let i = 1; i <= lastNonZero; i++) {
          const value = quantized[ZIGZAG[i]];
          if (value === 0) {
            run++;
            continue;
          }
          while (run > 15) {
            const zrl = ac.get(0xf0); // ZRL: sixteen zeros
            bw.write(zrl.code, zrl.length);
            run -= 16;
          }
          const { category, bits } = amplitude(value);
          const e = ac.get((run << 4) | category);
          bw.write(e.code, e.length);
          bw.write(bits, category);
          run = 0;
        }
        if (lastNonZero < 63) {
          const eob = ac.get(0x00);
          bw.write(eob.code, eob.length);
        }
      }
    }
  }
  bw.flush();

  /* ---- Markers ---------------------------------------------------------- */
  const out = [];
  const u8 = (v) => out.push(v & 0xff);
  const u16 = (v) => {
    out.push((v >> 8) & 0xff);
    out.push(v & 0xff);
  };
  const marker = (m) => {
    u8(0xff);
    u8(m);
  };

  marker(0xd8); // SOI

  marker(0xe0); // APP0 / JFIF
  u16(16);
  for (const c of "JFIF") u8(c.charCodeAt(0));
  u8(0);
  u16(0x0101); // version 1.1
  u8(0); // no density units
  u16(1);
  u16(1);
  u8(0);
  u8(0);

  marker(0xdb); // DQT — both tables in one segment
  u16(2 + 2 * 65);
  u8(0x00);
  for (let i = 0; i < 64; i++) u8(qy[ZIGZAG[i]]);
  u8(0x01);
  for (let i = 0; i < 64; i++) u8(qc[ZIGZAG[i]]);

  marker(0xc0); // SOF0 — baseline, 3 components, no subsampling
  u16(8 + 3 * 3);
  u8(8);
  u16(height);
  u16(width);
  u8(3);
  for (const [id, q] of [
    [1, 0],
    [2, 1],
    [3, 1],
  ]) {
    u8(id);
    u8(0x11); // 1x1 sampling — 4:4:4
    u8(q);
  }

  for (const [cls, id, spec] of [
    [0, 0, HUFF.dcLuma],
    [0, 1, HUFF.dcChroma],
    [1, 0, HUFF.acLuma],
    [1, 1, HUFF.acChroma],
  ]) {
    marker(0xc4); // DHT
    u16(2 + 1 + 16 + spec.vals.length);
    u8((cls << 4) | id);
    for (let i = 1; i <= 16; i++) u8(spec.bits[i]);
    for (const v of spec.vals) u8(v);
  }

  marker(0xda); // SOS
  u16(6 + 2 * 3);
  u8(3);
  for (const [id, t] of [
    [1, 0x00],
    [2, 0x11],
    [3, 0x11],
  ]) {
    u8(id);
    u8(t);
  }
  u8(0);
  u8(63);
  u8(0);

  for (const b of bw.bytes) u8(b);

  marker(0xd9); // EOI

  return Buffer.from(out);
}

/* ========================================================================== */
/*  A small flat-plane rasteriser                                             */
/* ========================================================================== */

/** Deterministic PRNG, so a rerun produces byte-identical files. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const lerp = (a, b, t) => a + (b - a) * t;
const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

/** The palette of the building. Not site tokens — the materials in the room. */
const M = {
  paper: hex("#f3f1eb"),
  paperEdge: hex("#d8d3c9"),
  wall: hex("#dcd7ce"),
  wallLit: hex("#e9e5dd"),
  stone: hex("#c9c3b8"),
  stoneDark: hex("#a39c90"),
  floor: hex("#aea598"),
  wood: hex("#3e3129"),
  woodDark: hex("#2a211c"),
  woodLight: hex("#5a4a3e"),
  iron: hex("#2b2a28"),
  window: hex("#f7f6f1"),
  mullion: hex("#c9c4ba"),
};

const SS = 2;

/**
 * Renders one plate. `draw` receives a painter whose coordinates are
 * normalised 0–1 on both axes; `light` shades the result, brighter towards the
 * upper right.
 */
function plate(W, H, seed, draw, light = (u, v) => 0.9 + 0.16 * (0.6 * u + 0.4 * (1 - v))) {
  const w = W * SS;
  const h = H * SS;
  const buf = new Float32Array(w * h * 3);
  const random = rng(seed);

  const colourAt = (fill, u, v) => (typeof fill === "function" ? fill(u, v) : fill);

  const painter = {
    poly(points, fill, alpha = 1) {
      const pts = points.map(([x, y]) => [x * w, y * h]);
      let minY = Infinity;
      let maxY = -Infinity;
      for (const [, y] of pts) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      const y0 = Math.max(0, Math.ceil(minY - 0.5));
      const y1 = Math.min(h - 1, Math.floor(maxY - 0.5));
      const xs = [];
      for (let py = y0; py <= y1; py++) {
        const sy = py + 0.5;
        xs.length = 0;
        for (let i = 0; i < pts.length; i++) {
          const [ax, ay] = pts[i];
          const [bx, by] = pts[(i + 1) % pts.length];
          if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) {
            xs.push(ax + ((sy - ay) / (by - ay)) * (bx - ax));
          }
        }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) {
          const xa = Math.max(0, Math.ceil(xs[k] - 0.5));
          const xb = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
          for (let px = xa; px <= xb; px++) {
            const c = colourAt(fill, (px + 0.5) / w, sy / h);
            const o = (py * w + px) * 3;
            buf[o] = lerp(buf[o], c[0], alpha);
            buf[o + 1] = lerp(buf[o + 1], c[1], alpha);
            buf[o + 2] = lerp(buf[o + 2], c[2], alpha);
          }
        }
      }
    },
    rect(x0, y0, x1, y1, fill, alpha = 1) {
      painter.poly(
        [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ],
        fill,
        alpha,
      );
    },
    /** A rotated rectangle. Only square plates use it, so degrees are true. */
    rrect(cx, cy, rw, rh, deg, fill, alpha = 1) {
      const a = (deg * Math.PI) / 180;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const corner = (dx, dy) => [cx + dx * c - dy * s, cy + dx * s + dy * c];
      painter.poly(
        [corner(-rw / 2, -rh / 2), corner(rw / 2, -rh / 2), corner(rw / 2, rh / 2), corner(-rw / 2, rh / 2)],
        fill,
        alpha,
      );
    },
    ellipse(cx, cy, rx, ry, fill, alpha = 1) {
      const n = 96;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]);
      }
      painter.poly(pts, fill, alpha);
    },
    random,
  };

  draw(painter);

  // Box-filter down, then light, vignette and a fine luminance grain.
  const out = Buffer.alloc(W * H * 3);
  const grain = rng(seed ^ 0x9e3779b9);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W;
      const v = (y + 0.5) / H;
      const du = u - 0.5;
      const dv = v - 0.5;
      const shade = light(u, v) * (1 - 0.16 * (du * du + dv * dv) * 2);
      const n = (grain() - 0.5) * 6;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let sy = 0; sy < SS; sy++) {
          for (let sx = 0; sx < SS; sx++) {
            sum += buf[((y * SS + sy) * w + (x * SS + sx)) * 3 + c];
          }
        }
        out[(y * W + x) * 3 + c] = clamp255((sum / (SS * SS)) * shade + n);
      }
    }
  }
  return out;
}

/** A vertical gradient fill. */
const vgrad = (top, bottom) => (_u, v) => mixc(top, bottom, v);
/** A horizontal gradient fill, `a` at the left edge. */
const hgrad = (a, b) => (u) => mixc(a, b, u);

/* ========================================================================== */
/*  The six compositions                                                      */
/* ========================================================================== */

/** o-01 — a long empty meeting table beside a tall window, chairs pushed in. */
function meetingRoom(p) {
  p.rect(0, 0, 1, 0.68, hgrad(M.wall, M.wallLit));
  p.rect(0, 0.68, 1, 1, vgrad(M.floor, mixc(M.floor, M.woodDark, 0.25)));
  // The window, its mullions, and the light it throws across the floor.
  p.rect(0.62, 0.06, 0.86, 0.64, M.window);
  p.rect(0.735, 0.06, 0.745, 0.64, M.mullion);
  p.rect(0.62, 0.345, 0.86, 0.355, M.mullion);
  p.rect(0.6, 0.64, 0.88, 0.66, M.stone);
  p.poly(
    [
      [0.6, 0.7],
      [0.86, 0.7],
      [0.7, 0.99],
      [0.36, 0.99],
    ],
    mixc(M.floor, M.window, 0.45),
  );
  // Shadow under the table.
  p.poly(
    [
      [0.1, 0.7],
      [0.86, 0.7],
      [0.8, 0.8],
      [0.04, 0.8],
    ],
    M.woodDark,
    0.28,
  );
  // Chair backs behind the table.
  for (let i = 0; i < 7; i++) {
    const x = 0.17 + i * 0.087;
    p.rect(x, 0.515, x + 0.048, 0.6, mixc(M.iron, M.wall, 0.25));
  }
  // The table: top, front edge, apron.
  p.poly(
    [
      [0.14, 0.595],
      [0.8, 0.595],
      [0.87, 0.655],
      [0.07, 0.655],
    ],
    hgrad(M.wood, M.woodLight),
  );
  p.rect(0.07, 0.655, 0.87, 0.672, M.woodDark);
  p.rect(0.1, 0.672, 0.12, 0.8, M.woodDark);
  p.rect(0.82, 0.672, 0.84, 0.8, M.woodDark);
  // Chair backs on the near side, pushed in.
  for (let i = 0; i < 7; i++) {
    const x = 0.12 + i * 0.1;
    p.rect(x, 0.63, x + 0.058, 0.79, mixc(M.iron, M.woodDark, 0.4));
  }
}

/** o-02 — a wall of dark wooden shelving holding unlabelled bound volumes. */
function shelves(p) {
  p.rect(0, 0, 1, 1, vgrad(M.woodLight, M.wood));
  const boards = [0.1, 0.285, 0.47, 0.655, 0.84];
  const bindings = ["#6b6259", "#8a7f72", "#4f4a44", "#a39a8c", "#5e5046", "#3f3a35", "#76695c"].map(hex);
  for (let b = 0; b < boards.length - 1; b++) {
    const top = boards[b] + 0.018;
    const floor = boards[b + 1];
    // The back of the bay, in shadow.
    p.rect(0, top, 1, floor, M.woodDark, 0.55);
    let x = 0.03;
    while (x < 0.97) {
      const bw = 0.011 + p.random() * 0.02;
      const height = (floor - top) * (0.68 + p.random() * 0.26);
      if (p.random() < 0.06) {
        x += bw * 1.5; // a gap on the shelf
        continue;
      }
      const colour = bindings[Math.floor(p.random() * bindings.length)];
      p.rect(x, floor - height, Math.min(x + bw, 0.97), floor, colour);
      // A band where the spine meets the light — no lettering, only tone.
      p.rect(x, floor - height, Math.min(x + bw, 0.97), floor - height + 0.006, mixc(colour, M.paper, 0.2));
      x += bw + 0.0015;
    }
  }
  for (const y of boards) {
    p.rect(0, y, 1, y + 0.018, M.woodLight);
    p.rect(0, y, 1, y + 0.004, mixc(M.woodLight, M.paper, 0.25));
  }
  for (const x of [0, 0.325, 0.66, 0.985]) p.rect(x, 0, x + 0.018, 1, M.wood);
}

/** o-03 — an empty stone stairwell with a handrail, light from above. */
function stairwell(p) {
  p.rect(0, 0, 1, 1, vgrad(M.window, M.stone));
  const steps = 12;
  const pts = [[0, 1]];
  for (let i = 0; i < steps; i++) {
    const x = 0.04 + i * 0.075;
    const y = 0.95 - i * 0.068;
    pts.push([x, y + 0.068], [x, y]);
  }
  pts.push([1, 0.95 - (steps - 1) * 0.068], [1, 1]);
  const riser = pts.map(([x, y]) => [x, y]);
  p.poly(riser, vgrad(M.stone, M.stoneDark));
  // Tread noses catching the light.
  for (let i = 0; i < steps; i++) {
    const x = 0.04 + i * 0.075;
    const y = 0.95 - i * 0.068;
    p.rect(x, y, Math.min(1, x + 0.075), y + 0.008, mixc(M.stone, M.window, 0.55));
  }
  // Handrail and balusters, parallel to the pitch.
  const railY = (x) => 0.74 - (x - 0.04) * (0.068 / 0.075);
  p.poly(
    [
      [0, railY(0)],
      [1, railY(1)],
      [1, railY(1) + 0.014],
      [0, railY(0) + 0.014],
    ],
    M.iron,
  );
  for (let i = 0; i < steps; i += 2) {
    const x = 0.075 + i * 0.075;
    const foot = 0.95 - i * 0.068;
    p.rect(x, railY(x), x + 0.005, foot, M.iron, 0.9);
  }
}

/** o-04 — a corridor of closed panelled doors, receding. */
function corridor(p) {
  const vx0 = 0.44;
  const vx1 = 0.56;
  const vyTop = 0.38;
  const vyBot = 0.54;
  p.poly([[0, 0], [1, 0], [vx1, vyTop], [vx0, vyTop]], vgrad(M.wallLit, M.wall));
  p.poly([[0, 1], [1, 1], [vx1, vyBot], [vx0, vyBot]], vgrad(M.stoneDark, M.floor));
  p.poly([[0, 0], [vx0, vyTop], [vx0, vyBot], [0, 1]], hgrad(M.stone, M.wall));
  p.poly([[1, 0], [vx1, vyTop], [vx1, vyBot], [1, 1]], hgrad(M.wallLit, M.wall));
  p.rect(vx0, vyTop, vx1, vyBot, M.window);

  // A point on a side wall at depth s (0 = the viewer, 1 = the far end).
  const side = (s, left) => {
    const x = left ? lerp(0, vx0, s) : lerp(1, vx1, s);
    const top = lerp(0, vyTop, s);
    const bottom = lerp(1, vyBot, s);
    return { x, top, bottom, height: bottom - top };
  };
  const door = (s1, s2, left) => {
    const a = side(s1, left);
    const b = side(s2, left);
    const head = (q) => q.bottom - 0.66 * q.height;
    p.poly([[a.x, head(a)], [b.x, head(b)], [b.x, b.bottom], [a.x, a.bottom]], M.wood);
    const t0 = 0.2;
    const t1 = 0.8;
    const ia = side(lerp(s1, s2, t0), left);
    const ib = side(lerp(s1, s2, t1), left);
    p.poly(
      [
        [ia.x, head(ia) + 0.1 * ia.height],
        [ib.x, head(ib) + 0.1 * ib.height],
        [ib.x, ib.bottom - 0.08 * ib.height],
        [ia.x, ia.bottom - 0.08 * ia.height],
      ],
      M.woodLight,
    );
  };
  for (const [s1, s2] of [
    [0.06, 0.22],
    [0.38, 0.48],
    [0.58, 0.645],
    [0.72, 0.76],
    [0.81, 0.835],
  ]) {
    door(s1, s2, true);
    door(s1 + 0.03, s2 + 0.03, false);
  }
}

/** d-01 — overhead: stacked blank paper and a closed folder on a desk. */
function paper(p) {
  p.rect(0, 0, 1, 1, vgrad(M.woodLight, M.wood));
  // Grain in the desk.
  for (let i = 0; i < 70; i++) {
    const y = p.random();
    p.rect(0, y, 1, y + 0.002 + p.random() * 0.003, M.woodDark, 0.25);
  }
  // Shadows first, offset away from the light (towards the lower left).
  p.rrect(0.44, 0.56, 0.5, 0.64, -4, M.woodDark, 0.45);
  p.rrect(0.66, 0.4, 0.36, 0.46, 9, M.woodDark, 0.45);
  // The stack, sheet by sheet.
  const sheets = [
    [0.47, 0.53, -5],
    [0.465, 0.525, -3],
    [0.46, 0.52, -1.5],
    [0.462, 0.518, 1],
  ];
  for (const [cx, cy, deg] of sheets) {
    p.rrect(cx, cy, 0.46, 0.6, deg, M.paperEdge);
    p.rrect(cx, cy, 0.455, 0.595, deg, M.paper);
  }
  // The closed folder, overlapping the stack's corner.
  p.rrect(0.69, 0.37, 0.34, 0.44, 8, hex("#7d7468"));
  p.rrect(0.69, 0.37, 0.34, 0.012, 8, hex("#6a6258"));
}

/** d-02 — a plain glass of water and a capped pen on a bare surface. */
function glassAndPen(p) {
  p.rect(0, 0, 1, 0.5, vgrad(M.wall, M.wallLit));
  p.rect(0, 0.5, 1, 1, vgrad(M.stone, mixc(M.stone, M.stoneDark, 0.6)));
  // Shadow of the glass, cast towards the lower left.
  p.ellipse(0.4, 0.8, 0.2, 0.05, M.woodDark, 0.22);
  // The glass: a tapered body, the water, the rim and one highlight.
  const glass = [
    [0.4, 0.28],
    [0.64, 0.28],
    [0.62, 0.79],
    [0.42, 0.79],
  ];
  p.poly(glass, mixc(M.wall, M.window, 0.35), 0.75);
  p.poly(
    [
      [0.407, 0.45],
      [0.633, 0.45],
      [0.62, 0.79],
      [0.42, 0.79],
    ],
    mixc(M.stone, hex("#dfe3e1"), 0.6),
    0.8,
  );
  p.rect(0.407, 0.448, 0.633, 0.455, M.window);
  p.ellipse(0.52, 0.28, 0.12, 0.012, M.mullion, 0.9);
  p.rect(0.585, 0.3, 0.597, 0.76, M.window, 0.8);
  p.ellipse(0.52, 0.79, 0.1, 0.012, M.stoneDark, 0.8);
  // The pen, capped, lying at an angle across the surface.
  p.poly(
    [
      [0.18, 0.9],
      [0.72, 0.84],
      [0.723, 0.855],
      [0.183, 0.915],
    ],
    M.iron,
  );
  p.poly(
    [
      [0.18, 0.9],
      [0.34, 0.882],
      [0.343, 0.897],
      [0.183, 0.915],
    ],
    hex("#3a3936"),
  );
}

/* ========================================================================== */
/*  Slots — paths match src/content/media.ts exactly                          */
/* ========================================================================== */

const slots = [
  { file: "o-01.jpg", w: 1536, h: 1024, seed: 101, draw: meetingRoom },
  { file: "o-02.jpg", w: 1536, h: 1024, seed: 102, draw: shelves },
  { file: "o-03.jpg", w: 1536, h: 1024, seed: 103, draw: stairwell, light: (u, v) => 0.84 + 0.22 * (1 - v) },
  { file: "o-04.jpg", w: 1536, h: 1024, seed: 104, draw: corridor },
  { file: "d-01.jpg", w: 1024, h: 1024, seed: 105, draw: paper },
  { file: "d-02.jpg", w: 1024, h: 1024, seed: 106, draw: glassAndPen },
];

let total = 0;
let largest = 0;
for (const slot of slots) {
  const pixels = plate(slot.w, slot.h, slot.seed, slot.draw, slot.light);
  const jpeg = encodeJpeg(slot.w, slot.h, pixels, 80);
  writeFileSync(join(outDir, slot.file), jpeg);
  total += jpeg.length;
  largest = Math.max(largest, jpeg.length);
  console.log(`${slot.file}  ${slot.w}×${slot.h}  ${(jpeg.length / 1024).toFixed(0)} KB`);
}

console.log(
  `generated ${slots.length} plates → public/media/  total ${(total / 1024).toFixed(0)} KB, ` +
    `largest ${(largest / 1024).toFixed(0)} KB (budget 300 KB each)`,
);
if (largest > 300 * 1024) {
  console.error("a plate is over the 300 KB budget");
  process.exit(1);
}
