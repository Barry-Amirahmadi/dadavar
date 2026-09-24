"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Browser capability reads, done as subscriptions rather than as state set from
 * an effect.
 *
 * The obvious version — `useState(false)` plus an effect that calls
 * `setState(matchMedia(...).matches)` — works, but it renders once with the
 * wrong answer, and it never notices if the answer changes afterwards. Both
 * matter here: a reader can turn "reduce motion" on while the page is open, and
 * a tablet with a keyboard case attached gains a real pointer mid-session.
 *
 * `useSyncExternalStore` is the API for exactly this. It also keeps the value
 * correct through hydration, via the separate server snapshot.
 */

/** Live result of a media query. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    // On the server nothing is known about the reader. `false` is the safe
    // answer for every query this project asks: it means "full motion, no
    // pointer", which is the state the markup is authored for.
    () => false,
  );
}

/** Nothing to subscribe to — the answer cannot change after load. */
const NEVER_CHANGES = () => () => {};

/**
 * Whether the browser can observe intersections at all. Universally supported
 * since 2019, so this is defensive rather than load-bearing — but a scroll
 * reveal that silently never fires would hide the page's content, which is a
 * worse failure than any it protects against.
 */
export function useSupportsIntersectionObserver(): boolean {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => typeof IntersectionObserver !== "undefined",
    () => true,
  );
}
