import type { ResolvedProduct } from "@/types/content";
import { productPage } from "@/content/sections";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The prose and the key information, on one spread.
 *
 * Set as a ledger of hairline rows, the same idiom as the values section on the
 * homepage — a list of facts genuinely is a list, and a rule between two of them
 * separates them more honestly than a card would.
 *
 * The block renders nothing at all when a product has neither body copy nor
 * details. That is the normal case for a product a CMS editor has only just
 * created, and an empty heading over an empty ledger looks broken in a way that
 * an absent section does not.
 */
export function ProductDetails({ product }: { product: ResolvedProduct }) {
  const hasBody = Boolean(product.body?.length);
  const hasDetails = Boolean(product.details?.length);
  if (!hasBody && !hasDetails) return null;

  return (
    <Section ground="light" aria-labelledby="product-details-heading">
      <h2 id="product-details-heading" className="sr-only">
        {productPage.detailsHeading}
      </h2>

      <div className="grid-editorial">
        {hasBody ? (
          <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-6">
            {product.body!.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 90}>
                <p className="t-lead">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        ) : null}

        {hasDetails ? (
          <dl
            className={
              hasBody
                ? "col-span-4 md:col-span-8 lg:col-start-8 lg:col-span-5"
                : "col-span-4 md:col-span-8 lg:col-span-6"
            }
          >
            {product.details!.map((detail, index) => (
              <Reveal
                as="div"
                key={detail.label}
                delay={index * 70}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--color-line)] py-4 first:border-t"
              >
                <dt className="t-meta">{detail.label}</dt>
                <dd className="t-body">{detail.value}</dd>
              </Reveal>
            ))}
          </dl>
        ) : null}
      </div>
    </Section>
  );
}
