import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  areaBySlug,
  areas,
  areasInGroup,
  groupAnchor,
  groupOf,
} from "@/content/practice";
import { annotate } from "@/content/refs";
import { ui } from "@/content/ui";
import { Plate } from "@/components/Plate";
import { RefMark } from "@/components/RefMark";
import { SectionOpener } from "@/components/SectionOpener";
import { cell } from "@/components/cells";
import { toFa } from "@/lib/digits";
import { fill } from "@/lib/fill";
import { pageMetadata } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const area = areaBySlug((await params).slug);
  if (!area) return {};
  return pageMetadata({
    title: area.title,
    description: area.standfirst,
    path: `/practice/${area.slug}/`,
  });
}

/**
 * One practice area, as an essay: opener, standfirst, an optional plate, the
 * body in two columns with its word-scale initial and reference marks, a
 * marginal note, and the other two areas in the group.
 *
 * Grid placement, per cells.ts — every cell names its row and column:
 *
 *                 < 900px    900–1199px   ≥ 1200px
 *   body wrapper  contents   row 1        row 1 · col 1
 *   segment 1     row 1      (in body)    (in body)
 *   note          row 2      row 2        row 1 · col 2
 *   segment 2     row 3      (in body)    (in body)
 *   segment 3     row 4      (in body)    (in body)
 */
export default async function PracticeAreaPage({ params }: { params: Params }) {
  const area = areaBySlug((await params).slug);
  if (!area) notFound();

  const group = groupOf(area);
  const related = areasInGroup(group.id).filter((other) => other.slug !== area.slug);
  const segments = annotate(area);

  return (
    <article className="wrap band" aria-labelledby="area-title">
      <header className="page-head">
        <SectionOpener
          numeral={toFa(area.number)}
          title={area.title}
          level={1}
          id="area-title"
          kicker={
            <Link href={`/practice/#${groupAnchor(group.id)}`}>
              {fill(ui.practice.kicker, { numeral: group.numeral, name: group.name })}
            </Link>
          }
        />
        <p className="standfirst">{area.standfirst}</p>
      </header>

      {area.image ? <Plate asset={area.image} /> : null}

      <div className="essay">
        <div
          className="essay-body prose cols cell"
          style={cell({ row: 1 }, { row: 1, col: 1 }, { row: 1 })}
          data-prose="essay"
        >
          {segments.map((segment, i) => (
            <div
              key={segment.heading ?? "opening"}
              className="segment cell"
              style={cell({ row: i === 0 ? 1 : i + 2 }, { row: 1 })}
              data-prose-leaf=""
            >
              {segment.heading ? <h2 className="subhead">{segment.heading}</h2> : null}
              {segment.paragraphs.map((paragraph, p) => (
                <p key={p}>
                  {i === 0 && p === 0 ? (
                    <>
                      <span className="initial">{area.lead}</span>{" "}
                    </>
                  ) : null}
                  {paragraph.map((run) =>
                    typeof run === "string" ? run : <RefMark key={run.id} mark={run} />,
                  )}
                </p>
              ))}
            </div>
          ))}
        </div>

        <aside
          className="marginal cell"
          style={cell({ row: 2 }, { row: 1, col: 2 }, { row: 2 })}
          aria-label={ui.practice.marginal}
        >
          <p>{area.marginal}</p>
        </aside>
      </div>

      <nav className="linkset" aria-labelledby="related-title">
        <h2 id="related-title" className="linkset-heading">
          {fill(ui.practice.related, { group: group.name })}
        </h2>
        <ul>
          {related.map((other) => (
            <li key={other.slug}>
              <Link href={`/practice/${other.slug}/`}>{other.title}</Link>
            </li>
          ))}
          <li>
            <Link href="/practice/">{ui.practice.allAreas}</Link>
          </li>
        </ul>
      </nav>
    </article>
  );
}
