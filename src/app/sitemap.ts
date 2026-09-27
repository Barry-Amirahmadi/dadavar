import type { MetadataRoute } from "next";
import { areas } from "@/content/practice";
import { absoluteUrl } from "@/lib/seo";

/**
 * Sitemap — thirteen routes: four static pages and the nine areas, from the
 * same list `generateStaticParams` uses, so it cannot name a page that was not
 * exported. No dates or priorities: the only date available at build time is
 * the build's own, which would be a claim that every page changed.
 */
/** Required under `output: "export"` — a metadata route is dynamic by default. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/practice/", "/notes/", "/about/"];
  const details = areas.map((area) => `/practice/${area.slug}/`);

  return [...routes, ...details].map((path) => ({ url: absoluteUrl(path) }));
}
