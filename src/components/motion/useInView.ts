"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery, useSupportsIntersectionObserver } from "@/lib/useMediaQuery";

interface Options {
  /** Fraction of the element that must be visible before it counts. */
  threshold?: number;
  /** Shrinks or grows the trigger band. Accepts the IO margin syntax. */
  rootMargin?: string;
  /** Stop observing after the first entry. True for reveals, false for the
   *  ambient shade, which has to track the element leaving again. */
  once?: boolean;
}

/**
 * The single scroll primitive in this project. Everything that responds to
 * scroll — reveals, image settles, the ambient shade — goes through here, so
 * there is exactly one observer implementation to reason about.
 *
 * Anyone who asked for less motion, or whose browser cannot observe, gets the
 * finished state rather than an empty page. That is derived rather than set
 * from an effect, which means it is right on the first render and stays right
 * if the reader changes the preference while the page is open — no observer is
 * created at all in that case.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.18,
  rootMargin = "0px 0px -12% 0px",
  once = true,
}: Options = {}) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const canObserve = useSupportsIntersectionObserver();
  const alwaysVisible = reduced || !canObserve;

  useEffect(() => {
    if (alwaysVisible) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setSeen(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [alwaysVisible, threshold, rootMargin, once]);

  return { ref, inView: alwaysVisible || seen };
}
