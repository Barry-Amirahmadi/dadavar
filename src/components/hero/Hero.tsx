import { hero } from "@/content/sections";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The hero states the thesis: a small collection, made slowly.
 *
 * Desktop composition is right-weighted. The type occupies the first five
 * columns — the right edge in RTL, where a Persian reader starts — and the
 * photograph runs off the left edge of the page, so the eye travels from type
 * into image along the reading direction rather than against it.
 *
 * Mobile is recomposed, not compressed. The section is built from three
 * placeable blocks so the photograph can sit BETWEEN the headline and the
 * supporting copy: the reader gets the claim, then the picture, then the
 * explanation. Stacking the desktop order instead would bury the only image
 * below a screen and a half of text.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-[var(--section-y-tight)] lg:pt-14">
      <div className="container">
        <div className="grid-editorial">
          {/* 1 — the claim */}
          <div className="order-1 col-span-4 flex flex-col gap-6 md:col-span-8 lg:order-none lg:col-start-1 lg:col-span-5 lg:row-start-1 lg:self-end">
            <Reveal>
              <Eyebrow>{hero.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="t-display max-w-[11ch]">{hero.heading}</h1>
            </Reveal>
          </div>

          {/* 2 — the photograph. Bleeds off both page edges on mobile, off the
                 left edge only on desktop where the type holds the right. */}
          <div className="order-2 col-span-4 md:col-span-8 lg:order-none lg:col-start-6 lg:col-span-7 lg:row-start-1 lg:row-span-2">
            <div className="relative mx-[calc(var(--gutter)*-1)] lg:ms-0 lg:me-[calc(var(--gutter)*-1)]">
              {/* The 4:5 crop is the preferred shape; the frame is capped
                  against viewport height so the call to action stays reachable,
                  and the image crops rather than pushing the page down. */}
              <EditorialImage
                media={hero.image}
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
                className="max-h-[48vh] lg:max-h-[66vh]"
              />

              {/* Inset study, straddling the bottom edge of the main frame on
                  the side nearest the type — half on the photograph, half on
                  the page. */}
              <figure className="absolute -bottom-14 start-10 hidden w-[30%] max-w-[13rem] lg:block">
                <EditorialImage
                  media={hero.inset}
                  sizes="13rem"
                  delay={420}
                  className="shadow-[var(--shadow-lift)]"
                />
                <figcaption className="t-meta pt-2">{hero.insetCaption}</figcaption>
              </figure>
            </div>
          </div>

          {/* 3 — the explanation and the action */}
          <div className="order-3 col-span-4 flex flex-col gap-7 md:col-span-8 lg:order-none lg:col-start-1 lg:col-span-5 lg:row-start-2 lg:self-start lg:pt-10">
            <Reveal delay={180}>
              <p className="t-lead">{hero.lead}</p>
            </Reveal>
            <Reveal delay={260}>
              <div className="flex flex-wrap items-center gap-3">
                <Button href={hero.primary.href} variant="primary">
                  {hero.primary.label}
                </Button>
                <Button href={hero.secondary.href} variant="secondary">
                  {hero.secondary.label}
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Closing rule: brand label at the start of the line, orientation at
            the end. Hidden on mobile, where the fold does the same job. */}
        <div className="mt-16 hidden items-center justify-between gap-6 border-t border-[var(--color-line)] pt-4 md:flex lg:mt-32">
          <p className="t-label">{site.brand.latin} — SKIN CARE</p>
          <p className="t-meta flex items-center gap-2">
            {hero.scrollHint}
            <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true" focusable="false">
              <path d="M6 1v13M1 9l5 5 5-5" stroke="currentColor" strokeWidth="1.1" fill="none" />
            </svg>
          </p>
        </div>
      </div>
    </section>
  );
}
