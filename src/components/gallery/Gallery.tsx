"use client";

import { useState } from "react";
import { sortedGallery } from "@/content/gallery";
import { gallery } from "@/content/sections";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { GalleryTile } from "./GalleryTile";
import { GalleryLightbox } from "./GalleryLightbox";

/**
 * Editorial gallery.
 *
 * One grid, one tile size: four columns of twelve, so the six plates sit three
 * across in two even rows, and every plate carries the same 4/5 crop the
 * products do.
 *
 * It was a masonry wall before — three bands, six different spans, three
 * different vertical offsets and six different crops, on the argument that a
 * moving top edge is what a masonry layout is for. That argument holds when the
 * pictures are real and each crop is chosen for its subject. Here it produced
 * six rectangles of six sizes with nothing in common, which reads as images
 * gathered from six places rather than one shoot — the same fault the product
 * catalogue had, in a section whose whole job is to look considered.
 *
 * The rhythm the bands were reaching for now lives where it costs nothing: the
 * reveal still staggers across each row, and the section sits between two
 * full-width neighbours that do vary.
 *
 * `sizes` is one string because every tile is now one width. The tile spans a
 * third of the grid above 1024, half of it from 768, and the full width below
 * that.
 */
const TILE_CLASS = "col-span-4 md:col-span-4 lg:col-span-4";
const TILE_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw";

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="ground-light-deep">
      <div className="container py-[var(--section-y)]">
        <SectionHeading
          id="gallery-heading"
          eyebrow={gallery.eyebrow}
          heading={gallery.heading}
          lead={gallery.lead}
          className="mb-[var(--section-y-tight)]"
        />

        <div className="grid-editorial items-start">
          {sortedGallery.map((item, i) => (
            <Reveal key={item.id} delay={(i % 3) * 90} className={TILE_CLASS}>
              <GalleryTile
                item={item}
                sizes={TILE_SIZES}
                onOpen={() => setOpenIndex(i)}
              />
            </Reveal>
          ))}
        </div>

        {/* Into the full gallery, for a reader who wants the images larger.
            Same role as the link that closes the product showcase. */}
        <Reveal className="mt-[var(--section-y-tight)]">
          <Button href={gallery.allHref} variant="secondary">
            {gallery.allLabel}
          </Button>
        </Reveal>
      </div>

      <GalleryLightbox
        items={sortedGallery}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}
