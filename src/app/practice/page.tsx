import type { Metadata } from "next";
import { practiceIndex } from "@/content/pages";
import { areas } from "@/content/practice";
import { AreaIndex } from "@/components/AreaIndex";
import { SectionOpener } from "@/components/SectionOpener";
import { toFa } from "@/lib/digits";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: practiceIndex.seo.title,
  description: practiceIndex.seo.description,
  path: "/practice/",
});

/** The index: three groups, nine entries, one clause each, no prose. */
export default function PracticeIndexPage() {
  return (
    <div className="wrap band">
      <header className="page-head">
        <SectionOpener numeral={toFa(areas.length)} title={practiceIndex.heading} level={1} />
        <p className="standfirst">{practiceIndex.standfirst}</p>
      </header>
      <AreaIndex variant="rows" headingLevel={2} />
    </div>
  );
}
