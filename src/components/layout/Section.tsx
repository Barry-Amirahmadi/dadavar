import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionProps {
  children: ReactNode;
  id?: string;
  /** Which ground the section sits on. `dark` also flips every nested
   *  component to its dark treatment via the `.on-dark` scope. */
  ground?: "light" | "light-deep" | "dark" | "darkest" | "none";
  /** Vertical rhythm. Sections deliberately do not all breathe the same. */
  rhythm?: "default" | "tight" | "none";
  /** Set false when the section manages its own horizontal padding. */
  contained?: boolean;
  className?: string;
  "aria-labelledby"?: string;
}

const grounds = {
  light: "ground-light",
  "light-deep": "ground-light-deep",
  dark: "ground-dark on-dark",
  darkest: "ground-darkest on-dark",
  none: "",
} as const;

export function Section({
  children,
  id,
  ground = "light",
  rhythm = "default",
  contained = true,
  className,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(grounds[ground], className)}
      style={{
        paddingBlock:
          rhythm === "none" ? undefined : `var(--section-y${rhythm === "tight" ? "-tight" : ""})`,
      }}
      {...rest}
    >
      {contained ? <div className="container">{children}</div> : children}
    </section>
  );
}
