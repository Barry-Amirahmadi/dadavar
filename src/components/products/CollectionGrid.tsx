import type { ResolvedProduct } from "@/types/content";
import { collection } from "@/content/sections";
import { FALLBACK_TONE } from "@/content/resolveProducts";
import { ShadeField } from "@/components/motion/ShadeField";
import { CATALOGUE_ARRANGEMENT, CollectionItem } from "./CollectionItem";

/**
 * The collection itself.
 *
 * On the dark ground for the same reason the homepage showcase is — that is
 * where the product photography reads — and inside a ShadeField so the page
 * keeps taking the colour of the product being looked at. The signature is
 * extended to a second page here, not reimplemented: this is the same context,
 * the same registered custom property and the same two gradients.
 *
 * There is no heading above the grid. The page's `<h1>` is the masthead and
 * each product is an `<h2>`, which is the correct outline for a register of
 * things; a heading here would only be a label for a list the reader can
 * already see.
 */
export function CollectionGrid({ products }: { products: ResolvedProduct[] }) {
  return (
    <section aria-label={collection.listLabel} className="ground-dark on-dark">
      <ShadeField initialTone={products[0]?.tone ?? FALLBACK_TONE}>
        <div className="container py-[var(--section-y)]">
          <div className="grid-editorial collection-grid items-start">
            {/* Every product takes the same frame except the one declared
                `feature`, which keeps the layout-driven breakout. The test is
                the product's own `layout` value rather than its position, so
                reordering the collection moves the breakout with the product
                it belongs to instead of stranding it wherever fifth happens to
                fall. */}
            {products.map((product, index) => (
              <CollectionItem
                key={product.id}
                product={product}
                index={index}
                arrangement={
                  product.layout === "feature" ? undefined : CATALOGUE_ARRANGEMENT
                }
              />
            ))}
          </div>
        </div>
      </ShadeField>
    </section>
  );
}
