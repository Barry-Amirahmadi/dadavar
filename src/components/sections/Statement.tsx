import { statement } from "@/content/sections";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";

/**
 * A pause between the hero and the collection.
 *
 * One sentence, a great deal of air, no image and no call to action. Its job
 * is to change the pace so the product showcase does not read as a continuation
 * of the hero — whitespace doing structural work rather than decorative.
 */
export function Statement() {
  return (
    <Section ground="light-deep" rhythm="tight">
      <div className="grid-editorial">
        <div className="col-span-4 md:col-span-7 lg:col-start-2 lg:col-span-9">
          <Reveal>
            <p className="t-h2 text-balance">{statement.text}</p>
          </Reveal>
          <Reveal delay={140}>
            <p className="t-label mt-8">{statement.attribution}</p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
