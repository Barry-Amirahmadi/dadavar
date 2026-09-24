"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Tracks which in-page section the reader is currently in, so the header can
 * mark it. The trigger band is the upper third of the viewport: a section
 * counts as "current" once its start has scrolled past the header, which is
 * how a reader would describe it.
 *
 * The header lives in the layout and therefore survives navigation, so this has
 * to re-observe on every route change: the sections it is looking for exist on
 * one page and not on another, and an observer set up where they did not exist
 * would stay empty for the rest of the session.
 *
 * The result is stored together with the path it was measured on, and returned
 * only when they still match. That way a value left over from the previous page
 * is ignored without clearing state from inside an effect.
 */
export function useActiveSection(ids: string[]) {
  const pathname = usePathname();
  const [entry, setEntry] = useState<{ path: string; id: string | null }>({
    path: pathname,
    id: null,
  });

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const item of entries) {
          visible.set(item.target.id, item.isIntersecting ? item.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        setEntry({ path: pathname, id: best });
      },
      { threshold: [0, 0.25, 0.5, 0.75], rootMargin: "-20% 0px -40% 0px" },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [ids, pathname]);

  return entry.path === pathname ? entry.id : null;
}
