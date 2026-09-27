import { site } from "@/content/site";
import { absoluteUrl } from "@/lib/seo";

/**
 * Schema.org mapping — one block, the organisation, and deliberately thin.
 *
 * Structured data is the easiest place on a site to assert something false,
 * because no reader ever sees it and the vocabulary invites filling in a shape.
 * For a law firm the vocabulary is especially inviting: `LegalService`,
 * `areaServed`, `award`, `foundingDate`, `memberOf`, `hasCredential`,
 * `aggregateRating`. Every one of those would be a claim about a firm that
 * does not exist, so none is used. Plain `Organization`, no `sameAs`, no
 * `logo`, no `founder`, no `foundingDate`.
 */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.brand.name,
    alternateName: site.brand.latin,
    url: absoluteUrl("/"),
    description: site.seo.description,
    image: absoluteUrl(site.seo.ogImage.src),
  };
}
