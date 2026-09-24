import { about } from "@/content/sections";
import { pageMetadata } from "@/lib/seo";
import { BrandStory } from "@/components/sections/BrandStory";
import { ContactSection } from "@/components/sections/ContactSection";

/**
 * About / Contact — one page, not two.
 *
 * The brand has one short account of itself and one set of contact details.
 * Splitting that across two routes would give each of them half a page of
 * content and a heading doing the work the content should (§19 — do not force
 * five pages if the requirement needs fewer). «تماس با ما» in the nav deep-links
 * to the contact block instead.
 *
 * No closing CtaSection here, unlike every other page: that band's whole job is
 * to send a reader to the contact block, and this *is* the contact block.
 */
export const metadata = pageMetadata({
  title: about.seo.title,
  description: about.seo.description,
  path: "/about/",
});

export default function AboutPage() {
  return (
    <>
      <BrandStory />
      <ContactSection />
    </>
  );
}
