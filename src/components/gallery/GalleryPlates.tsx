"use client";

import { useState } from "react";
import type { GalleryItem } from "@/types/content";
import { toFa } from "@/lib/digits";
import { Reveal } from "@/components/motion/Reveal";
import { GalleryTile } from "./GalleryTile";
import { GalleryLightbox } from "./GalleryLightbox";

/**
 * The gallery at page scale.
 *
 * The homepage band and this page show the same six images, and the difference
 * is deliberately one of *scale* rather than content: there, they are a wall of
 * tiles you glance across; here, they are plates you look at one at a time.
 * Three across becomes two across, and the plate grows from roughly 420px wide
 * to roughly 640px on a 1440 screen.
 *
 * It used to compose itself instead — cycling solo bands and pairs, sizing each
 * plate by its crop, alternating which edge a solo hugged and giving phones a
 * third width again. Every one of those rules was individually defensible and
 * the result was six plates at four sizes with a top edge that never settled,
 * which reads as a page that could not decide rather than as a composition. One
 * frame, repeated, is what makes six pictures look like one body of work.
 *
 * Nothing here is generated from the crop any more, so the old height argument
 * is gone with it: at six columns a 4/5 plate is about 800px tall on a 1440
 * screen and is seen whole, which is the one thing a gallery plate has to do.
 * That holds because the catalogue now has a single ratio — see the note in
 * `src/content/products.ts`. A mixed-ratio gallery would need this reconsidered.
 *
 * Any number of images composes, which the fixed table on the homepage cannot
 * do: a seventh image simply starts a fourth row.
 */
const PLATE_CLASS = "col-span-4 md:col-span-4 lg:col-span-6";
const PLATE_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 46vw";

export function GalleryPlates({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      {/* The grid's own row-gap is sized for text blocks. Plates need the
          section rhythm between rows, which is what the bands used to carry in
          a margin between them. */}
      <div
        className="grid-editorial items-start"
        style={{ rowGap: "var(--section-y-tight)" }}
      >
        {items.map((item, index) => (
          <Reveal key={item.id} delay={(index % 2) * 110} className={PLATE_CLASS}>
            {/* Plate number, the way a catalogue numbers its images. Decorative
                — the figure below carries the title and the caption — so it is
                kept out of the accessibility tree rather than read aloud as a
                stray number before every picture. */}
            <p className="t-meta mb-3" aria-hidden="true">
              {toFa(String(index + 1).padStart(2, "0"))}
            </p>
            <GalleryTile
              item={item}
              sizes={PLATE_SIZES}
              onOpen={() => setOpenIndex(index)}
            />
          </Reveal>
        ))}
      </div>

      <GalleryLightbox
        items={items}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
