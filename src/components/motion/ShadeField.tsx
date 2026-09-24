"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

const ShadeContext = createContext<(tone: string) => void>(() => {});

/** Called by whatever is currently on screen to claim the ambient colour. */
export function useShade() {
  return useContext(ShadeContext);
}

interface ShadeFieldProps {
  children: ReactNode;
  /** The colour before anything has claimed the field. */
  initialTone: string;
  className?: string;
  id?: string;
}

/**
 * The signature element.
 *
 * Shade is the organising idea of cosmetics, so the page uses it as its only
 * ambient effect: the section quietly takes on the colour of the product you
 * are reading. It is one CSS custom property, interpolated because --shade is
 * registered with @property, driving two soft radial gradients behind the
 * content. No library, no scroll listener, no per-frame work.
 */
export function ShadeField({ children, initialTone, className, id }: ShadeFieldProps) {
  const [tone, setTone] = useState(initialTone);
  const claim = useCallback((next: string) => setTone(next), []);
  const style = useMemo(() => ({ "--shade": tone }) as CSSProperties, [tone]);

  return (
    <ShadeContext.Provider value={claim}>
      <div id={id} className={cn("shade-field", className)} style={style}>
        {children}
      </div>
    </ShadeContext.Provider>
  );
}
