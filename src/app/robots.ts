import type { MetadataRoute } from "next";
import { absoluteUrl, basePathForRobots } from "@/lib/seo";

/**
 * robots.txt.
 *
 * **A caveat worth knowing before reading anything into this file:** a crawler
 * only ever fetches `/robots.txt` from the *origin root*. On a GitHub Pages
 * project site the deployment owns `user.github.io/repo/`, not
 * `user.github.io/`, so the file generated here is served at
 * `/repo/robots.txt` and no crawler will look for it there — the rules that
 * actually apply come from whatever sits at the root, which this repository
 * does not control.
 *
 * It is generated anyway because it is correct for the two deployments that
 * matter for a template: a custom domain, and a user or organisation site. Both
 * serve this repo from the root, and there the file lands exactly where it
 * should. Nothing here needs changing when that happens.
 */
/** Required under `output: "export"` — see the note in `sitemap.ts`. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: basePathForRobots }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
