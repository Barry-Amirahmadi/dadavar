"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { MediaAsset } from "@/types/content";
import { cn } from "@/lib/cn";
import { useInView } from "@/components/motion/useInView";
import { withBasePath } from "@/lib/basePath";

interface EditorialImageProps {
  media: MediaAsset;
  /** Responsive width hint for the optimizer. Always pass a real one. */
  sizes: string;
  /** Only the hero image should set this. */
  priority?: boolean;
  delay?: number;
  className?: string;
}

/**
 * The only way an image enters this site.
 *
 * Owns the crop, the loading strategy and the settle animation, so every
 * picture on the page is treated identically — which is what makes a set of
 * unrelated images read as one shoot.
 *
 * Images are served unoptimized: a static host has no optimisation server.
 * That also means Next does not prefix the deployment base path onto the src,
 * so it goes through withBasePath() here — the single chokepoint every image
 * on the site passes through.
 */
export function EditorialImage({
  media,
  sizes,
  priority = false,
  delay = 0,
  className,
}: EditorialImageProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 });
  const isVector = media.src.endsWith(".svg");

  return (
    <div
      ref={ref}
      data-in={priority ? true : inView}
      className={cn("img-frame", className)}
      style={
        {
          aspectRatio: media.ratio.replace("/", " / "),
          "--reveal-delay": `${delay}ms`,
        } as CSSProperties
      }
    >
      <div className="img-shift">
        <Image
          src={withBasePath(media.src)}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          unoptimized={isVector}
          className="img-zoom"
        />
      </div>
    </div>
  );
}
