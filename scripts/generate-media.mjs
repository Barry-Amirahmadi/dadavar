/**
 * Placeholder art direction generator.
 *
 * Phase 01 has no client photography. Rather than pulling unrelated stock
 * images, every image slot is filled with a generated "material study": a
 * defocused tonal field in the brand palette with film grain and a single
 * soft light source coming from the top-right (the RTL reading origin).
 *
 * They share one treatment, so the page reads as a single art-directed shoot.
 * Each file maps 1:1 onto a real photograph later — same path, same ratio.
 *
 *   node scripts/generate-media.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "media");
mkdirSync(outDir, { recursive: true });

/** Brand grounds — kept in sync with src/app/tokens.css */
const GROUND = {
  bone: "#EAE9E3",
  boneDeep: "#DDDBD2",
  sormeh: "#141A2B",
};

/**
 * A slot = one image on the page.
 * `tone` is the dominant colour of the study; `ground` is what it sits on;
 * `mass` positions the defocused object (0–1 in each axis) and sizes it.
 */
const slots = [
  // — Hero —
  { name: "hero-main", w: 1200, h: 1500, tone: "#8FA8A3", ground: GROUND.boneDeep, mass: [0.52, 0.58, 0.46], seed: 3 },
  { name: "hero-inset", w: 700, h: 700, tone: "#C2A98C", ground: GROUND.bone, mass: [0.44, 0.5, 0.62], seed: 11 },

  // — Product showcase (tone matches the product's `tone` in content/products.ts) —
  { name: "product-shab", w: 1100, h: 1375, tone: "#3E4C6B", ground: GROUND.sormeh, mass: [0.5, 0.55, 0.5], seed: 5 },
  { name: "product-rooz", w: 1200, h: 900, tone: "#B9C4BD", ground: GROUND.sormeh, mass: [0.46, 0.5, 0.44], seed: 8 },
  { name: "product-narm", w: 1000, h: 1250, tone: "#C99A5B", ground: GROUND.sormeh, mass: [0.54, 0.56, 0.48], seed: 17 },
  { name: "product-aghaz", w: 1000, h: 1000, tone: "#7FA3A0", ground: GROUND.sormeh, mass: [0.5, 0.52, 0.56], seed: 23 },
  { name: "product-aram", w: 1600, h: 1000, tone: "#9D8FA8", ground: GROUND.sormeh, mass: [0.58, 0.5, 0.4], seed: 29 },

  // — Brand / values —
  { name: "values-texture", w: 1000, h: 1333, tone: "#5F8A85", ground: GROUND.boneDeep, mass: [0.48, 0.54, 0.58], seed: 13 },

  // — Gallery —
  { name: "gallery-01", w: 1200, h: 1500, tone: "#A9B6AF", ground: GROUND.boneDeep, mass: [0.5, 0.52, 0.52], seed: 41 },
  { name: "gallery-02", w: 900, h: 900, tone: "#CDB79C", ground: GROUND.bone, mass: [0.46, 0.48, 0.6], seed: 43 },
  { name: "gallery-03", w: 900, h: 1200, tone: "#8D9AAE", ground: GROUND.boneDeep, mass: [0.54, 0.56, 0.5], seed: 47 },
  { name: "gallery-04", w: 1400, h: 900, tone: "#B7A7A0", ground: GROUND.bone, mass: [0.5, 0.5, 0.42], seed: 53 },
  { name: "gallery-05", w: 900, h: 1125, tone: "#6F8C88", ground: GROUND.boneDeep, mass: [0.48, 0.54, 0.54], seed: 59 },
  { name: "gallery-06", w: 1200, h: 800, tone: "#C4B39A", ground: GROUND.bone, mass: [0.56, 0.5, 0.46], seed: 61 },

  // — Closing CTA —
  { name: "cta-field", w: 1920, h: 1000, tone: "#5F7A78", ground: GROUND.sormeh, mass: [0.34, 0.58, 0.78], seed: 67 },
];


/* `name` is destructured off by the caller, not used in the markup. */
const svg = ({ w, h, tone, ground, mass, seed }) => {
  const [mx, my, msize] = mass;
  const cx = w * mx;
  const cy = h * my;
  const rx = Math.min(w, h) * msize * 0.5;
  const ry = rx * 1.28;
  const blur = Math.min(w, h) * 0.13;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <defs>
    <radialGradient id="light" cx="78%" cy="18%" r="88%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.34"/>
      <stop offset="52%" stop-color="#FFFFFF" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
    </radialGradient>
    <linearGradient id="fall" x1="1" y1="0" x2="0.1" y2="1">
      <stop offset="0%" stop-color="${tone}" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="${tone}" stop-opacity="0.34"/>
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${blur.toFixed(1)}"/>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="g"/>
      <feComponentTransfer in="g" result="gt">
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="gt" mode="overlay"/>
    </filter>
  </defs>

  <g filter="url(#grain)">
    <rect width="${w}" height="${h}" fill="${ground}"/>
    <rect width="${w}" height="${h}" fill="url(#fall)" opacity="0.55"/>
    <g filter="url(#soft)">
      <ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="${tone}" opacity="0.85"/>
      <ellipse cx="${(cx + rx * 0.42).toFixed(0)}" cy="${(cy - ry * 0.46).toFixed(0)}" rx="${(rx * 0.5).toFixed(0)}" ry="${(ry * 0.34).toFixed(0)}" fill="#FFFFFF" opacity="0.26"/>
      <ellipse cx="${(cx - rx * 0.62).toFixed(0)}" cy="${(cy + ry * 0.5).toFixed(0)}" rx="${(rx * 0.7).toFixed(0)}" ry="${(ry * 0.4).toFixed(0)}" fill="#000000" opacity="0.2"/>
    </g>
    <rect width="${w}" height="${h}" fill="url(#light)"/>
  </g>
</svg>
`;
};

let count = 0;
for (const slot of slots) {
  writeFileSync(join(outDir, `${slot.name}.svg`), svg(slot), "utf8");
  count += 1;
}
console.log(`generated ${count} placeholder studies → public/media/`);
