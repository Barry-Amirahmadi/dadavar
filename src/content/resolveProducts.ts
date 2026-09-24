import type { Product, ProductLayout, ResolvedProduct } from "@/types/content";

/**
 * Fills in the presentation fields a CMS editor can leave empty.
 *
 * Both `tone` and `layout` do real design work — one drives the ambient shade
 * wash, the other the showcase rhythm — but neither is something a content
 * editor should be *required* to think about. The moment a CMS lets someone
 * save a product without them, an undefined value would either blank the
 * page's atmosphere or crash the arrangement lookup.
 *
 * Every product reaching a component goes through here, so the rules live in
 * one place and the components stay free of `?? fallback` noise.
 */

/**
 * Cycle order for an unset `layout`.
 *
 * MASTER-HANDOFF §48.2 prescribes `tall → wide → compact → feature`. That order
 * is not used verbatim, because it conflicts with a defect the same document
 * forbids reintroducing (§36.8, "incorrect product image-side alternation"):
 * `wide` and `compact` both sit on the left of the grid, so placing them
 * adjacently produces two left-hand images in a row — the exact rhythm problem
 * that was found and fixed in Phase 01.
 *
 * Moving `feature` between them keeps all four arrangements, keeps the cycle
 * length at four, and means no two neighbouring products ever share a side —
 * including across the wrap from the last back to the first:
 *
 *   tall(right) → wide(left) → feature(full width) → compact(left) → tall(right) …
 *
 * The intent of §48.2 is a deterministic spread; this delivers that without
 * breaking §36.8.
 */
const LAYOUT_CYCLE: readonly ProductLayout[] = ["tall", "wide", "feature", "compact"];

/**
 * Shade for a product with no `tone`.
 *
 * Deliberately a near-neutral deepening of the dark ground rather than an
 * invented colour: a product whose shade nobody chose should read as having no
 * particular atmosphere, not as having the wrong one. It also cannot reduce
 * text contrast, since it is darker than the ground it washes over.
 *
 * Kept in sync with the `@property --shade` initial-value in tokens.css.
 */
export const FALLBACK_TONE = "#2A3550";

export function resolveProduct(product: Product, index: number): ResolvedProduct {
  return {
    ...product,
    tone: product.tone ?? FALLBACK_TONE,
    layout: product.layout ?? LAYOUT_CYCLE[index % LAYOUT_CYCLE.length],
  };
}

/**
 * Position matters: `layout` falls back by index, so the list handed in must be
 * the one that actually renders, in render order. Resolving a filtered list and
 * an unfiltered one would assign different arrangements to the same product.
 */
export function resolveProducts(list: readonly Product[]): ResolvedProduct[] {
  return list.map(resolveProduct);
}
