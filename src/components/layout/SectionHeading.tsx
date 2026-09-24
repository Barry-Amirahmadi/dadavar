import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  heading: string;
  lead?: string;
  /** `level` keeps the document outline correct even when the visual size of
   *  the heading stays the same. Never style a heading into the wrong level.
   *  Level 1 is for a page opener — one per document, and only where this
   *  block *is* the page's title rather than a section's. */
  level?: 1 | 2 | 3;
  className?: string;
}

const levels = {
  1: { tag: "h1", type: "t-h1" },
  2: { tag: "h2", type: "t-h2" },
  3: { tag: "h3", type: "t-h2" },
} as const;

/**
 * Section header, set as a spread rather than a stack.
 *
 * The heading occupies the first half of the grid — the right, where reading
 * starts — and the standfirst sits across the gutter in the last four columns,
 * dropped to align with the heading's lower lines. A hairline runs the full
 * width above both.
 *
 * Stacking the two would leave most of a 1440px row empty, which reads as a
 * gap rather than as space. This fills the measure the way a magazine opener
 * does, and collapses to a single column below 1024.
 */
export function SectionHeading({
  id,
  eyebrow,
  heading,
  lead,
  level = 2,
  className,
}: SectionHeadingProps) {
  const { tag: Tag, type } = levels[level];

  return (
    <div className={cn("section-head", className)}>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>

      <div className="grid-editorial mt-7 items-end">
        <Reveal delay={80} className="col-span-4 md:col-span-8 lg:col-span-7">
          <Tag id={id} className={cn(type, "max-w-[16ch]")}>
            {heading}
          </Tag>
        </Reveal>

        {lead ? (
          <Reveal
            delay={160}
            className="col-span-4 md:col-span-8 lg:col-start-9 lg:col-span-4"
          >
            <p className="t-lead">{lead}</p>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
