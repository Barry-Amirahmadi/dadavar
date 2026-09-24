import { about } from "@/content/sections";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The brand's own account of itself.
 *
 * Three paragraphs against one standing image — the arrangement the homepage's
 * values section already uses, which is the right precedent: this is the same
 * kind of block, reading rather than looking.
 *
 * The photograph is the workspace shot from the gallery rather than the product
 * texture the homepage stands beside, because an about page is about the place
 * the work happens and reusing the homepage's image would make the two sections
 * read as one repeated.
 */
export function BrandStory() {
  return (
    <>
      <Section ground="light" rhythm="tight" aria-labelledby="about-heading">
        <SectionHeading
          id="about-heading"
          level={1}
          eyebrow={about.eyebrow}
          heading={about.heading}
          lead={about.lead}
        />
      </Section>

      <Section ground="light" rhythm="none" contained>
        <div className="grid-editorial pb-[var(--section-y)] items-start">
          <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-6">
            {about.body.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 90}>
                <p className="t-lead">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <div className="col-span-4 md:col-span-8 lg:col-start-8 lg:col-span-5 lg:mt-16">
            <EditorialImage
              media={about.image}
              sizes="(max-width: 1024px) 100vw, 40vw"
              delay={120}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
