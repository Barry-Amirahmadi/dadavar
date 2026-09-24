import Image from "next/image";
import type { NavItem } from "@/types/content";
import { cta } from "@/content/sections";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { withBasePath } from "@/lib/basePath";

/**
 * Closing conversion band.
 *
 * The darkest ground on the site and the only section where the type runs to
 * display size on a photograph — this is where the page is loudest, and it is
 * loud exactly once. The action is a consultation, not a checkout: nothing in
 * the brief establishes a store.
 *
 * The primary action lands on the contact block of the about page, where both
 * inquiry paths and the direct details are. A call to action that resolves to
 * itself is a dead end — which is why this band is absent from that page.
 *
 * The band is site-wide, so the secondary link is overridable: it points at the
 * collection, and on the collection page itself that would be the same dead end
 * the paragraph above is about. Passing `null` drops it and leaves one action.
 */
export function CtaSection({ secondary = cta.secondary }: { secondary?: NavItem | null }) {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="ground-darkest on-dark relative overflow-hidden"
    >
      <Image
        src={withBasePath(cta.image.src)}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        unoptimized={cta.image.src.endsWith(".svg")}
        className="object-cover opacity-70"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            /* Falls off toward the left, so the photograph is readable where
               there is no type and near-opaque under the heading. */
            "linear-gradient(to left, var(--color-sormeh-deep) 18%, color-mix(in srgb, var(--color-sormeh-deep) 88%, transparent) 46%, color-mix(in srgb, var(--color-sormeh-deep) 40%, transparent))",
        }}
      />

      <div className="container relative py-[var(--section-y)]">
        <div className="grid-editorial">
          <div className="col-span-4 flex flex-col gap-7 md:col-span-8 lg:col-span-6">
            <Reveal>
              <Eyebrow>{cta.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 id="cta-heading" className="t-h1">
                {cta.heading}
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="t-lead">{cta.body}</p>
            </Reveal>
            <Reveal delay={220}>
              <div className="flex flex-wrap items-center gap-3">
                <Button href={cta.primary.href} variant="primary">
                  {cta.primary.label}
                </Button>
                {secondary ? (
                  <Button href={secondary.href} variant="secondary">
                    {secondary.label}
                  </Button>
                ) : null}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
