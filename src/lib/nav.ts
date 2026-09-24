/**
 * Navigation href helpers.
 *
 * Content hrefs are written from the site root (`/products/`, `/#contact` — see
 * the link rule in `src/content/sections.ts`), which means a single href can
 * carry both a route and an in-page target. These two functions are the only
 * place that string is taken apart, so the header, the footer and any future
 * page agree on what a given nav item points at.
 *
 * Paths are compared with a normalised trailing slash: the site builds with
 * `trailingSlash: true`, so `usePathname()` reports `/products/` while content
 * may reasonably be authored as either form.
 */

/** The element id a nav href scrolls to, or null when it navigates instead. */
export function hashTarget(href: string): string | null {
  const hash = href.indexOf("#");
  if (hash === -1) return null;
  return href.slice(hash + 1) || null;
}

/** The route part of an href, normalised so `/products/` === `/products`. */
export function routePath(href: string): string {
  const path = href.split("#")[0] || "/";
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}
