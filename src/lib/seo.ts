import type { Metadata } from "next";
import { site } from "@/content/site";
import { basePath } from "./basePath";

/**
 * Absolute URLs for canonicals, Open Graph, the sitemap and structured data.
 *
 * All four need a *full* URL — a root-relative path is meaningless to a crawler
 * that found the page somewhere else — and composing one here is the only place
 * the two halves of the deployed address are put back together.
 *
 * They arrive separately and this is the trap: `actions/configure-pages` reports
 * `origin` and `base_path` as two outputs, and the deploy workflow passes them
 * in as two variables. On a GitHub Pages *project* site the origin is
 * `https://user.github.io` while the site actually lives at
 * `https://user.github.io/repo`. Anything built from the origin alone is a URL
 * that resolves to somebody else's page — a canonical pointing at the wrong
 * site is worse than none at all, because it actively tells a search engine to
 * index that one instead.
 */
const rawOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://parnian.example";

export const origin = rawOrigin.replace(/\/+$/, "");

/** Where the site really starts: origin plus base path, no trailing slash. */
export const siteRoot = `${origin}${basePath}`;

export function absoluteUrl(path = "/"): string {
  return `${siteRoot}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The crawlable root, as a path. `/` at the origin, `/repo/` under a base path.
 * robots.txt takes paths rather than URLs, so this is the one place the base
 * path is needed on its own.
 */
export const basePathForRobots = basePath ? `${basePath}/` : "/";

const ogImage = {
  url: absoluteUrl(site.seo.ogImage.src),
  width: site.seo.ogImage.width,
  height: site.seo.ogImage.height,
  alt: site.seo.ogImage.alt,
};

interface PageMeta {
  /** The route's own title. Omit on the homepage, which is the site title. */
  title?: string;
  description: string;
  /** Route path, with the leading and trailing slash. */
  path: string;
}

/**
 * Title, description, canonical and social cards for one route.
 *
 * Every route goes through here rather than assembling its own `Metadata`,
 * because the fields have to agree: before this, `og:title` was set once in the
 * root layout and inherited unchanged by all six routes, so every shared link
 * previewed as the homepage regardless of what it pointed at.
 *
 * Two Next behaviours this works around deliberately:
 *
 * - The title is set as `absolute`, bypassing the root's `%s — پرنیان`
 *   template, and the same composed string is used for `og:title`. The template
 *   applies to `<title>` only, so routing both through one variable is what
 *   keeps them from drifting apart again.
 * - `openGraph` and `twitter` are merged shallowly: a route that declares
 *   `openGraph` at all does **not** inherit the parent's `openGraph.images`.
 *   Hence the card is repeated here rather than left to the layout.
 */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
  const composed = title ? site.seo.titleTemplate.replace("%s", title) : site.seo.title;
  const url = absoluteUrl(path);

  return {
    title: { absolute: composed },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      siteName: site.brand.name,
      url,
      title: composed,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: composed,
      description,
      images: [ogImage],
    },
  };
}
