import { publishedProducts } from "@/content/products";
import { pageMetadata } from "@/lib/seo";
import { collectCategories } from "@/content/categories";
import { collection } from "@/content/sections";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { CategoryIndex } from "@/components/products/CategoryIndex";
import { CollectionGrid } from "@/components/products/CollectionGrid";
import { CtaSection } from "@/components/sections/CtaSection";

/**
 * Collection page.
 *
 * The homepage showcase and this page render the same five products, and the
 * difference between them is the point: the showcase is the *narrative* cut —
 * five full spreads, read in sequence, arguing that the products make a routine
 * — while this is the *register*, where the collection can be surveyed at once
 * and entered at any point. Same content, same rhythm vocabulary, different
 * density and a different job.
 *
 * Order is the editor's order, not re-sorted into category blocks. Sequencing
 * is an editorial decision in this project (§28, §48.2), and with five
 * single-product categories, grouping would produce five headed groups of one —
 * the repeated-row template the whole design exists to avoid.
 */
export const metadata = pageMetadata({
  title: collection.seo.title,
  description: collection.seo.description,
  path: "/products/",
});

export default function CollectionPage() {
  const products = publishedProducts;
  const categories = collectCategories(products);

  return (
    <>
      <Section ground="light" rhythm="tight" aria-labelledby="collection-heading">
        <SectionHeading
          id="collection-heading"
          level={1}
          eyebrow={collection.eyebrow}
          heading={collection.heading}
          lead={collection.lead}
        />
        <CategoryIndex categories={categories} total={products.length} />
      </Section>

      <CollectionGrid products={products} />

      {/* One call to action, not two. The secondary link on the homepage's
          closing band points at this page, which from here would be a link to
          where the reader already is. */}
      <CtaSection secondary={null} />
    </>
  );
}
