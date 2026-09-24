"use client";

import { useCallback, useEffect } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useShade } from "./ShadeField";
import { useInView } from "./useInView";

/**
 * How a product claims the ambient shade — MASTER-HANDOFF §50, in one place.
 *
 * The original rule tied the shade to scroll, which is correct only where one
 * product occupies the viewport at a time. Anywhere several are on screen at
 * once — the collection grid, a related-products block — scroll makes them
 * fight over the shared field and flicker. So the input is chosen once, by
 * capability rather than by page:
 *
 *   pointer available   → hover **and** keyboard focus, treated as equals
 *   no pointer          → the layout is single-column at that density, and the
 *                         original scroll rule is correct again
 *
 * Every multi-product view goes through this hook rather than reimplementing
 * the decision, so there is one place to change if the rule ever moves.
 */
export function useShadeClaim(tone: string) {
  const claimShade = useShade();
  const claim = useCallback(() => claimShade(tone), [claimShade, tone]);
  const pointerDriven = useMediaQuery("(hover: hover)");

  const { ref, inView } = useInView<HTMLElement>({
    threshold: 0.3,
    rootMargin: "-30% 0px -30% 0px",
    once: false,
  });

  useEffect(() => {
    if (!pointerDriven && inView) claim();
  }, [pointerDriven, inView, claim]);

  return {
    /** Attach to the element that represents the product. */
    ref,
    /** Spread onto the same element. Empty where there is no pointer. */
    claimProps: pointerDriven ? { onPointerEnter: claim, onFocus: claim } : {},
  };
}
