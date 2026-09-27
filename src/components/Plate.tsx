import Image from "next/image";
import type { MediaAsset } from "@/types/content";
import { withBasePath } from "@/lib/basePath";
import { cn } from "@/lib/cn";

/**
 * One of the six images, with its caption.
 *
 * `withBasePath` is required: with `images.unoptimized`, next/image does not
 * prefix the base path, and on a GitHub Pages project site every image would
 * 404 while looking perfect in development.
 */
export function Plate({ asset, className }: { asset: MediaAsset; className?: string }) {
  const wide = asset.ratio === "3/2";

  return (
    <figure className={cn("plate", wide ? "plate-3-2" : "plate-1-1", className)}>
      <Image
        src={withBasePath(asset.src)}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        sizes={wide ? "(min-width: 900px) 46rem, 100vw" : "(min-width: 900px) 26rem, 100vw"}
      />
      {asset.caption ? <figcaption>{asset.caption}</figcaption> : null}
    </figure>
  );
}
