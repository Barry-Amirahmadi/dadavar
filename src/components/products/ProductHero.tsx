import Link from "next/link";
import type { ResolvedProduct } from "@/types/content";
import { site } from "@/content/site";
import { inquiry, productPage } from "@/content/sections";
import { fillTemplate, whatsappLink } from "@/lib/whatsapp";
import { ShadeField } from "@/components/motion/ShadeField";
import { Reveal } from "@/components/motion/Reveal";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { ToneSwatch } from "@/components/ui/ToneSwatch";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

/**
 * Product opener.
 *
 * The one page on the site where the ambient shade has nothing to decide: a
 * single product is on screen, so the field simply holds that product's tone
 * for the whole section. §50's hover-or-scroll rule exists to arbitrate between
 * several products competing for the field — with one, there is no competition,
 * and the wash becomes what it always wanted to be here, the page's own colour.
 *
 * The photograph sits at the start edge, where a Persian reader begins, and the
 * copy across the gutter — the `tall` arrangement from the showcase, at hero
 * scale. On a phone that stacks to image-then-copy, which is the right order
 * for a page whose subject is the object itself.
 */
export function ProductHero({ product }: { product: ResolvedProduct }) {
  const message = fillTemplate(inquiry.message, { product: product.name });
  const chatHref = whatsappLink(site.contact.whatsapp, message);

  return (
    <section aria-labelledby="product-name" className="ground-dark on-dark">
      <ShadeField initialTone={product.tone}>
        <div className="container py-[var(--section-y-tight)]">
          <nav aria-label={productPage.breadcrumbLabel} className="mb-10">
            <ol className="t-meta flex flex-wrap items-center gap-x-2">
              <li>
                {/* next/link, not a raw anchor: only Link applies the deployment
                    base path, so a bare href="/" would leave the site entirely
                    when this is served from a GitHub Pages project subpath. */}
                <Link href="/" className="crumb">
                  {productPage.breadcrumbHome}
                </Link>
              </li>
              <li aria-hidden="true">·</li>
              <li>
                <Link href="/products/" className="crumb">
                  {productPage.breadcrumbCollection}
                </Link>
              </li>
              <li aria-hidden="true">·</li>
              <li aria-current="page" className="crumb text-[var(--color-chalk)]">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid-editorial items-center">
            <div className="col-span-4 md:col-span-8 lg:col-span-6">
              <EditorialImage
                media={product.image}
                sizes="(max-width: 1024px) 100vw, 48vw"
                priority
              />
            </div>

            {/* Six columns at `lg`, five from `xl`. At 1024 the five-column
                version is ~390px, which is narrower than the two actions laid
                side by side — they wrapped into a ragged stack. The empty
                gutter column is worth having, but not at the cost of breaking
                the row it frames. */}
            <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-start-7 lg:col-span-6 xl:col-start-8 xl:col-span-5">
              <Reveal>
                <Eyebrow>{product.category}</Eyebrow>
              </Reveal>

              <Reveal delay={80}>
                <h1 id="product-name" className="t-h1">
                  {product.name}
                </h1>
              </Reveal>

              {product.statement ? (
                <Reveal delay={140}>
                  <p className="t-lead">{product.statement}</p>
                </Reveal>
              ) : null}

              <Reveal delay={200}>
                <p className="t-meta flex items-center gap-3">
                  <ToneSwatch tone={product.tone} />
                  {product.latin}
                </p>
              </Reveal>

              <Reveal delay={260}>
                <div className="flex flex-wrap gap-3">
                  {/* The site's actual conversion point: an inquiry that already
                      knows which product it is about (§42). No cart exists. */}
                  <Button href={chatHref} external>
                    {inquiry.label}
                  </Button>
                  <Button href="/products/" variant="secondary">
                    {productPage.backLabel}
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </ShadeField>
    </section>
  );
}
