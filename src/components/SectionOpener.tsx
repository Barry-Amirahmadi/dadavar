import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionOpenerProps {
  /** Persian numeral or abjad letter, already formatted. Ornament: aria-hidden. */
  numeral: string;
  title: string;
  level: 1 | 2 | 3;
  size?: "lg" | "sm";
  id?: string;
  titleClassName?: string;
  kicker?: ReactNode;
}

/**
 * The one repeating ornament: a numeral in display type, a hairline rule in
 * oxblood, and the title. It does all the rhythmic work on every page, so it is
 * built once and never varied beyond two sizes.
 *
 * The numeral is hidden from assistive technology — it is ornament, and «۱
 * قراردادهای تجاری» read aloud as a heading adds nothing the list around it
 * does not already say.
 */
export function SectionOpener({
  numeral,
  title,
  level,
  size = "lg",
  id,
  titleClassName,
  kicker,
}: SectionOpenerProps) {
  const Heading = `h${level}` as const;

  return (
    <div className={cn("opener", size === "sm" && "opener-sm")}>
      <span className="opener-numeral" aria-hidden="true">
        {numeral}
      </span>
      <span className="opener-rule" aria-hidden="true" />
      <Heading id={id} className={cn("opener-title", titleClassName)}>
        {title}
      </Heading>
      {kicker ? <p className="opener-kicker">{kicker}</p> : null}
    </div>
  );
}
