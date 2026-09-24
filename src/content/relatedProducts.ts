import type { ResolvedProduct } from "@/types/content";

/**
 * What to show at the bottom of a product page.
 *
 * With five products in five distinct categories, "related" has no real
 * relation to express yet — so the honest thing is a rule that *would* express
 * one as the catalogue grows, and a heading that does not overclaim in the
 * meantime (the section is titled «ادامهٔ مجموعه», not «محصولات مرتبط»).
 *
 * The rule, in order:
 *
 * 1. Start reading from the product *after* this one and wrap around, so each
 *    page shows a different pair. Taking the first two of the list every time
 *    would make four of the five pages recommend the same two products.
 * 2. Prefer the same category. Inert today — no category has a second member —
 *    and the first thing that starts working when one does.
 */
export function relatedProducts(
  product: ResolvedProduct,
  all: readonly ResolvedProduct[],
  count = 2,
): ResolvedProduct[] {
  const position = all.findIndex((candidate) => candidate.id === product.id);
  if (position === -1) return all.slice(0, count);

  const following = [...all.slice(position + 1), ...all.slice(0, position)];

  return [
    ...following.filter((candidate) => candidate.category === product.category),
    ...following.filter((candidate) => candidate.category !== product.category),
  ].slice(0, count);
}
