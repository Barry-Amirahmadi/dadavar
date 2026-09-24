import type { MetadataRoute } from "next";
import { publishedProducts } from "@/content/products";
import { absoluteUrl } from "@/lib/seo";

/**
 * Sitemap, generated at build time.
 *
 * Product entries come from `publishedProducts`, the same list that drives
 * `generateStaticParams`, so the sitemap cannot list a page that was not
 * exported or miss one that was — including drafts, which are filtered out of
 * that list and correctly never appear here.
 *
 * No `lastModified`, `changeFrequency` or `priority`. The only date available
 * at build time is the build's own, which would claim every page changed
 * whenever the site was redeployed; the other two are hints Google has said
 * publicly it ignores. An absent field is better than a field that is wrong.
 *
 * The 404 page is not listed, for the obvious reason.
 */

/**
 * Required under `output: "export"`, and the build fails without it — Next
 * treats a metadata route as dynamic by default and refuses to export one.
 * Nothing here reads a request, so declaring it static is a statement of fact.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/products/", "/gallery/", "/about/"];
  const details = publishedProducts.map((product) => `/products/${product.slug}/`);

  return [...routes, ...details].map((path) => ({ url: absoluteUrl(path) }));
}
