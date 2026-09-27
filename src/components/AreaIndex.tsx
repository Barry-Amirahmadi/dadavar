import Link from "next/link";
import { areasInGroup, groupAnchor, groups } from "@/content/practice";
import { toFa } from "@/lib/digits";
import { cn } from "@/lib/cn";
import { SectionOpener } from "./SectionOpener";
import { cell } from "./cells";

/**
 * The nine areas in three groups. Not cards: a numbered list, hairlines
 * between entries, nothing boxed.
 *
 * `columns` is the home page — three groups side by side from 900px.
 * `rows` is `/practice/` — one group per row, the clause beside the title.
 * Either way each group is a grid cell with an explicit row and column.
 */
export function AreaIndex({
  variant,
  headingLevel,
}: {
  variant: "columns" | "rows";
  headingLevel: 2 | 3;
}) {
  return (
    <div className={cn("area-index", `area-index-${variant}`)}>
      {groups.map((group, i) => {
        const place =
          variant === "columns"
            ? cell({ row: i + 1 }, { row: 1, col: i + 1 })
            : cell({ row: i + 1 }, { row: i + 1 });
        const titleId = `${groupAnchor(group.id)}-title`;

        return (
          <section
            key={group.id}
            id={groupAnchor(group.id)}
            className="cell"
            style={place}
            aria-labelledby={titleId}
          >
            <SectionOpener
              numeral={group.numeral}
              title={group.name}
              level={headingLevel}
              size="sm"
              id={titleId}
            />
            <ol className="area-list">
              {areasInGroup(group.id).map((area) => (
                <li key={area.slug}>
                  <span className="area-num" aria-hidden="true">
                    {toFa(area.number)}
                  </span>
                  <p className="area-title">
                    <Link href={`/practice/${area.slug}/`}>{area.title}</Link>
                  </p>
                  <p className="area-clause">{area.clause}</p>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
