"use client";

import Link from "next/link";
import type { ProductLayout, ResolvedProduct } from "@/types/content";
import { productAnchor } from "@/content/categories";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { ToneSwatch } from "@/components/ui/ToneSwatch";
import { ArrowLead } from "@/components/ui/ArrowLead";
import { Reveal } from "@/components/motion/Reveal";
import { useShadeClaim } from "@/components/motion/useShadeClaim";
import { cn } from "@/lib/cn";

export interface Arrangement {
  /** Grid placement classes for the item. */
  cell: string;
  /** Vertical offset, desktop only — this is what moves the top edge. */
  offset: string;
  sizes: string;
}

/**
 * Collection-scale arrangements.
 *
 * The same four `layout` values as the homepage showcase, read at a different
 * density. On the homepage a layout describes a *spread* — one product filling
 * the screen, image on one side and copy across the gutter. Here it describes
 * how much of the row that product takes, so the whole collection can be
 * surveyed rather than scrolled through one product at a time.
 *
 * The spans are chosen so the cycle tiles: 5 + 7 fills a row, 12 is the
 * breakout, and 4 deliberately leaves the row short. Items are auto-placed
 * rather than given explicit column starts, so the composition survives an
 * editor reordering the collection — and in an RTL document auto-placement
 * starts at the right edge on its own, with no mirroring anywhere.
 *
 * Below `lg` the grid recomposes instead of shrinking (§31): at `md` the row is
 * half-and-half, and on a phone the items take alternating widths and edges —
 * the same treatment the gallery uses to keep a single column from flattening
 * into a stack of equal rectangles.
 */
const arrangements: Record<ProductLayout, Arrangement> = {
  tall: {
    cell: "col-span-3 md:col-span-4 md:col-start-auto lg:col-span-5",
    offset: "",
    sizes: "(max-width: 768px) 75vw, (max-width: 1024px) 50vw, 40vw",
  },
  wide: {
    cell: "col-span-4 md:col-span-8 lg:col-span-7",
    offset: "lg:mt-20",
    sizes: "(max-width: 1024px) 100vw, 56vw",
  },
  feature: {
    cell: "col-span-4 md:col-span-8 lg:col-span-12",
    offset: "",
    sizes: "100vw",
  },
  compact: {
    // Inset from the start edge on a phone, so two narrow items in sequence
    // are not mistaken for a column.
    cell: "col-span-3 col-start-2 md:col-span-4 md:col-start-auto lg:col-span-4",
    offset: "lg:mt-28",
    sizes: "(max-width: 768px) 75vw, (max-width: 1024px) 50vw, 32vw",
  },
};

/**
 * Even halves, for a block of exactly two — the related-products section.
 *
 * Deliberately not the layout-driven arrangements above: a pair drawn from
 * wherever the reader happens to be in the catalogue could come out as
 * `feature` beside `compact`, which is a breakout next to a thumbnail rather
 * than a considered pairing. A fixed pair is the honest treatment when the
 * component cannot know what it will be handed.
 */
/**
 * Even halves again, for the catalogue proper.
 *
 * The arrangements above still describe the homepage showcase, where one
 * product fills a spread and varying the frame is the rhythm. On this page the
 * same variation was doing the opposite: four frames at four widths, four
 * heights and four aspect ratios read as four pictures gathered from four
 * places rather than one product line photographed once. Real catalogue
 * photography is shot to a single standard — one lightbox, one angle, one crop
 * — so the frame has to be a constant here, and the rhythm has to come from
 * somewhere that does not touch the subject.
 *
 * It comes from the two things left: the vertical offsets are gone, so a pair
 * sits level and reads as a pair, and the feature product below still breaks
 * out across all twelve columns. Four equal frames then one wide one is a
 * cadence; four unequal ones are noise.
 *
 * Identical in value to `PAIR_ARRANGEMENT` and deliberately not merged with it:
 * that one exists because a pair of unknown products cannot be composed, this
 * one because a catalogue must not be. They answer to different rules and will
 * not necessarily move together.
 */
export const CATALOGUE_ARRANGEMENT: Arrangement = {
  cell: "col-span-4 md:col-span-4 lg:col-span-6",
  offset: "",
  sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 46vw",
};

export const PAIR_ARRANGEMENT: Arrangement = {
  cell: "col-span-4 md:col-span-4 lg:col-span-6",
  offset: "",
  sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 46vw",
};

interface CollectionItemProps {
  product: ResolvedProduct;
  /** Position in the rendered list — drives the reveal stagger only. */
  index: number;
  /** Overrides the layout-driven placement. */
  arrangement?: Arrangement;
  /** The product name's heading level, so the outline stays correct on any page. */
  headingLevel?: 2 | 3;
}

export function CollectionItem({
  product,
  index,
  arrangement,
  headingLevel = 2,
}: CollectionItemProps) {
  const placement = arrangement ?? arrangements[product.layout];
  const { ref, claimProps } = useShadeClaim(product.tone);

  const anchor = productAnchor(product.slug);
  const nameId = `${anchor}-name`;
  const href = `/products/${product.slug}`;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article
      ref={ref}
      id={anchor}
      aria-labelledby={nameId}
      {...claimProps}
      className={cn("group-media", placement.cell, placement.offset)}
    >
      {/* Two per row now, so the stagger counts in twos. On three it ran
          right-then-left down the first row and left-then-right down the
          second, which in an RTL document reads as the reveal changing its
          mind. */}
      <Reveal delay={(index % 2) * 90}>
        {/* Hidden from the tab order and the accessibility tree: the product
            name below goes to the same place, and one destination deserves one
            stop. Same rule as the homepage showcase. */}
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
          <EditorialImage media={product.image} sizes={placement.sizes} />
        </Link>
      </Reveal>

      <Reveal delay={(index % 2) * 90 + 90}>
        <div className="collection-item__meta">
          <p className="t-meta flex items-center gap-3">
            <ToneSwatch tone={product.tone} />
            {product.category}
          </p>
          <p className="t-label">{product.latin}</p>
        </div>

        <Heading id={nameId} className="t-h3 mt-4">
          <Link href={href} className="name-link group-link">
            <span className="name-link__text">{product.name}</span>
            <ArrowLead size={18} />
          </Link>
        </Heading>

        <p className="t-body mt-3 max-w-[34ch]">{product.description}</p>
      </Reveal>
    </article>
  );
}
