import { publishedProducts } from "@/content/products";
import { FALLBACK_TONE } from "@/content/resolveProducts";
import { showcase } from "@/content/sections";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ShadeField } from "@/components/motion/ShadeField";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { ProductRow } from "./ProductRow";

/**
 * The collection.
 *
 * Deliberately not a card grid. Each product gets its own arrangement on the
 * twelve-column grid — a different span, a different crop, a different
 * vertical offset — so the section reads as a sequence of spreads. The
 * arrangement travels with the content, so an editor reordering products in
 * the CMS keeps the rhythm rather than producing five identical rows.
 *
 * The section sits on the dark ground because that is where the product
 * photography reads; the brand speaks on the light grounds either side of it.
 */
export function ProductShowcase() {
  return (
    <section id="products" aria-labelledby="products-heading" className="ground-dark on-dark">
      <ShadeField initialTone={publishedProducts[0]?.tone ?? FALLBACK_TONE}>
        <div className="container py-[var(--section-y)]">
          <SectionHeading
            id="products-heading"
            eyebrow={showcase.eyebrow}
            heading={showcase.heading}
            lead={showcase.lead}
            className="mb-[var(--section-y-tight)]"
          />

          {publishedProducts.map((product, index) => (
            <ProductRow key={product.id} product={product} index={index} />
          ))}

          {/* The way out of the narrative sequence and into the register. The
              nav carries the same destination, but a reader who has just
              finished the showcase should not have to go back up to find it. */}
          <Reveal className="mt-[var(--section-y-tight)]">
            <Button href={showcase.allHref} variant="secondary">
              {showcase.allLabel}
            </Button>
          </Reveal>
        </div>
      </ShadeField>
    </section>
  );
}
