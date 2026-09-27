import type { Metadata } from "next";
import { about } from "@/content/pages";
import { Plate } from "@/components/Plate";
import { SectionOpener } from "@/components/SectionOpener";
import { toFa } from "@/lib/digits";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: about.seo.title,
  description: about.seo.description,
  path: "/about/",
});

/**
 * The firm as an institution — how it is organised, how it works, what it does
 * not do. No people, no history presented as fact, no founding year.
 *
 * The opener's numeral is «د»: the three groups are الف، ب، ج, and the firm
 * that holds them is the fourth letter. The home page's method band uses the
 * same letter for the same reason.
 */
export default function AboutPage() {
  return (
    <div className="wrap band">
      <header className="page-head">
        <SectionOpener numeral="د" title={about.heading} level={1} />
        <p className="standfirst">{about.standfirst}</p>
      </header>

      <Plate asset={about.image} />

      {about.sections.map((section, i) => {
        const titleId = `about-${i + 1}`;
        return (
          <section key={section.heading} className="about-section" aria-labelledby={titleId}>
            <SectionOpener
              numeral={toFa(i + 1)}
              title={section.heading}
              level={2}
              size="sm"
              id={titleId}
            />
            <div className="prose" data-prose="about">
              <p>{section.body}</p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
