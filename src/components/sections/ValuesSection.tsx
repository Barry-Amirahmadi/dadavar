import { brand, values } from "@/content/sections";
import { Section } from "@/components/layout/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { Reveal } from "@/components/motion/Reveal";

/**
 * How the brand works.
 *
 * Set as a ledger — four rows separated by hairlines, each one a position the
 * brand holds — because a list of principles is genuinely a list, and a rule
 * between two of them says "these are separate commitments" more honestly than
 * putting each in a card.
 *
 * Rhythm contrast with the showcase above: light ground, dense type, one
 * standing image instead of five.
 */
export function ValuesSection() {
  return (
    <Section id="brand" ground="light" aria-labelledby="brand-heading">
      <div className="grid-editorial">
        {/* Ledger — first six columns, the right side of the page */}
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <div className="flex flex-col gap-5">
            <Reveal>
              <Eyebrow>{brand.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 id="brand-heading" className="t-h2">
                {brand.heading}
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="t-lead">{brand.lead}</p>
            </Reveal>
          </div>

          <dl className="mt-12 border-t border-[var(--color-line)]">
            {values.map((value, i) => (
              <Reveal
                as="div"
                key={value.id}
                delay={i * 70}
                className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-[var(--color-line)] py-6 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]"
              >
                <dt className="t-h3">{value.title}</dt>
                <dd className="t-body max-w-[42ch]">{value.body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>

        {/* Standing image — held to the far column, top-aligned with the ledger */}
        <div className="col-span-4 md:col-span-8 lg:col-start-9 lg:col-span-4 lg:mt-24">
          <EditorialImage media={brand.image} sizes="(max-width: 1024px) 100vw, 28vw" delay={120} />
        </div>
      </div>
    </Section>
  );
}
