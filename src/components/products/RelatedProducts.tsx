import type { ResolvedProduct } from "@/types/content";
import { productPage } from "@/content/sections";
import { FALLBACK_TONE } from "@/content/resolveProducts";
import { ShadeField } from "@/components/motion/ShadeField";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { CollectionItem, PAIR_ARRANGEMENT } from "./CollectionItem";

/**
 * The way onward from a product page.
 *
 * This is a multi-product view, so it takes §50's shade rule from the start —
 * hover and keyboard focus where a pointer exists, scroll where it does not.
 * It gets that for free by reusing `CollectionItem`, which is the point of the
 * rule living in `useShadeClaim` rather than in the collection page.
 *
 * Products are set at a fixed even pair rather than at their own `layout`: the
 * two shown here are drawn from wherever the reader happens to be in the
 * catalogue, so a layout-driven pairing could come out as a full-bleed breakout
 * beside a thumbnail.
 */
export function RelatedProducts({ products }: { products: ResolvedProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="ground-dark on-dark">
      <ShadeField initialTone={products[0]?.tone ?? FALLBACK_TONE}>
        <div className="container py-[var(--section-y)]">
          <SectionHeading
            id="related-heading"
            eyebrow={productPage.relatedEyebrow}
            heading={productPage.relatedHeading}
            className="mb-[var(--section-y-tight)]"
          />

          <div className="grid-editorial collection-grid items-start">
            {products.map((product, index) => (
              <CollectionItem
                key={product.id}
                product={product}
                index={index}
                arrangement={PAIR_ARRANGEMENT}
                // The section heading is the h2; these are its children.
                headingLevel={3}
              />
            ))}
          </div>
        </div>
      </ShadeField>
    </section>
  );
}
