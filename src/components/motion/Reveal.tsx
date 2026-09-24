"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useInView } from "./useInView";

interface RevealProps {
  children: ReactNode;
  /** Semantic element to render. Motion must never dictate document structure. */
  as?: ElementType;
  /** Stagger, in ms. Keep runs short — three or four steps, then stop. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Fades and slides content in from the start edge of the reading direction.
 * The offset direction comes from --flow-start, so this is right-to-left here
 * and would be left-to-right under an English locale without a code change.
 */
export function Reveal({ children, as: Tag = "div", delay = 0, className, style }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      data-in={inView}
      className={cn("reveal", className)}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
