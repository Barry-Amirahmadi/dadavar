"use client";

import type { GalleryItem } from "@/types/content";
import { gallery } from "@/content/sections";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { cn } from "@/lib/cn";

interface GalleryTileProps {
  item: GalleryItem;
  sizes: string;
  onOpen: () => void;
  className?: string;
}

/**
 * One gallery image.
 *
 * A real <button>, because it does something rather than going somewhere —
 * which also means it is reachable by keyboard and announces itself correctly
 * without any ARIA patching.
 */
export function GalleryTile({ item, sizes, onOpen, className }: GalleryTileProps) {
  return (
    <figure className={cn("group-media", className)}>
      <button type="button" onClick={onOpen} className="gallery-tile">
        <EditorialImage media={item.image} sizes={sizes} />
        {/* The button's whole accessible name: the tile is an image and a
            button, so it has to say what pressing it does. `viewLabel` was
            already in the copy deck and this markup had a second copy of the
            same word — editing the field changed nothing until now. */}
        <span className="sr-only">
          {gallery.viewLabel} {item.title}
        </span>
      </button>
      <figcaption className="gallery-tile__meta">
        <span className="t-meta text-[var(--color-ink)]">{item.title}</span>
        <span className="t-meta">{item.caption ?? item.category}</span>
      </figcaption>
    </figure>
  );
}
