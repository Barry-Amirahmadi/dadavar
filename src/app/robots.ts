import type { MetadataRoute } from "next";

/**
 * robots.txt — disallow everything.
 *
 * DADAVAR is a demonstration of a fictional firm and should not be indexed.
 * On a GitHub Pages project site this file is served under the repository
 * subpath, where no crawler looks for it — crawlers only read robots.txt at
 * the origin root. The `robots` meta tag in the root layout is what actually
 * keeps the pages out of an index; this file is correct for the day the site
 * moves to its own domain.
 */
/** Required under `output: "export"` — a metadata route is dynamic by default. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
