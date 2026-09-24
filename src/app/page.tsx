import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/hero/Hero";
import { Statement } from "@/components/sections/Statement";
import { ProductShowcase } from "@/components/products/ProductShowcase";
import { ValuesSection } from "@/components/sections/ValuesSection";
import { Gallery } from "@/components/gallery/Gallery";
import { CtaSection } from "@/components/sections/CtaSection";

/**
 * Homepage.
 *
 * The scroll is a sequence of changing rhythms, not one component repeated:
 *
 *   Hero       light,  asymmetric, image-led
 *   Statement  sand,   one sentence, mostly air
 *   Showcase   dark,   five different arrangements, ambient shade
 *   Values     light,  dense ledger of hairline rows
 *   Gallery    sand,   three bands, uneven top edge
 *   CTA        darkest, display type over photography, loudest point
 *   Footer     dark,   colophon
 */
/** No `title`: the homepage *is* the site title, not a page within it. */
export const metadata = pageMetadata({
  description: site.seo.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <ProductShowcase />
      <ValuesSection />
      <Gallery />
      <CtaSection />
    </>
  );
}
