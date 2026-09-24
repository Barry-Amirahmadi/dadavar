import { sortedGallery } from "@/content/gallery";
import { pageMetadata } from "@/lib/seo";
import { galleryPage } from "@/content/sections";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { GalleryPlates } from "@/components/gallery/GalleryPlates";
import { CtaSection } from "@/components/sections/CtaSection";

/**
 * Gallery page.
 *
 * Masthead on the light ground, then the plates on the deeper light ground the
 * homepage band already uses — the gallery's own surface, kept so the page
 * reads as the same room seen from closer up rather than as a different one.
 *
 * The closing band keeps both of its actions here, unlike the collection and
 * product pages: from the gallery, «مشاهدهٔ محصولات» is a real onward step
 * rather than a link back to where the reader already is.
 */
export const metadata = pageMetadata({
  title: galleryPage.seo.title,
  description: galleryPage.seo.description,
  path: "/gallery/",
});

export default function GalleryPage() {
  return (
    <>
      <Section ground="light" rhythm="tight" aria-labelledby="gallery-page-heading">
        <SectionHeading
          id="gallery-page-heading"
          level={1}
          eyebrow={galleryPage.eyebrow}
          heading={galleryPage.heading}
          lead={galleryPage.lead}
        />
      </Section>

      <section aria-label={galleryPage.eyebrow} className="ground-light-deep">
        <div className="container pb-[var(--section-y)] pt-[var(--section-y-tight)]">
          <GalleryPlates items={sortedGallery} />
        </div>
      </section>

      <CtaSection />
    </>
  );
}
