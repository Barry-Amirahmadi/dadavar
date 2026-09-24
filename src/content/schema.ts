import type { Product } from "@/types/content";
import { site } from "@/content/site";
import { absoluteUrl } from "@/lib/seo";

/**
 * Schema.org mappings.
 *
 * Every field below reads straight off the content model. Nothing is invented
 * to satisfy a schema, which is the whole discipline here — structured data is
 * the easiest place on a site to assert something false, because no reader ever
 * sees it and the vocabulary invites you to fill in a shape.
 *
 * What that rules out, specifically:
 *
 * - **No `offers`** on a product — no price, currency, availability or seller
 *   exists, and this site has no commerce at all (§40). Google will not render
 *   a product rich result without one; a fabricated price to earn that snippet
 *   would be a lie told to a search engine about a business.
 * - **No `aggregateRating` or `review`.** There are no reviews.
 * - **No `sameAs`** on the organisation. The social handles are deliberate
 *   `.example` placeholders (§3.1 of the Task 6 report); `sameAs` asserts "this
 *   organisation *is* that account", which would be a false claim about URLs
 *   that do not resolve.
 * - **No `logo`.** No logo asset exists — the brand mark lives in the favicon
 *   and on the share card, neither of which is a logo file a real brand would
 *   supply. `image` carries the share card instead, which is what it is.
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
    address: {
      "@type": "PostalAddress",
      addressLocality: site.contact.city,
      addressCountry: "IR",
    },
  };
}

export function productSchema(product: Product): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seo?.description ?? product.description,
    category: product.category,
    url: absoluteUrl(`/products/${product.slug}/`),
    image: absoluteUrl(product.image.src),
    brand: { "@type": "Brand", name: site.brand.name },
  };
}
