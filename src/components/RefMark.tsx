import Link from "next/link";
import { noteAnchor, noteById } from "@/content/notes";
import type { MarkRef } from "@/content/refs";
import { ui } from "@/content/ui";
import { toFa } from "@/lib/digits";
import { fill } from "@/lib/fill";

/**
 * A reference mark: the note's number, raised, as a real link to that note on
 * `/notes/`. It carries its own id so the note can link back to *this* mark,
 * and an accessible name that says in words where it goes — «۲» alone is not a
 * destination.
 */
export function RefMark({ mark }: { mark: MarkRef }) {
  const numeral = toFa(mark.note);

  return (
    <Link
      id={mark.id}
      href={`/notes/#${noteAnchor(mark.note)}`}
      className="refmark"
      aria-label={fill(ui.refs.mark, { n: numeral, title: noteById(mark.note).title })}
    >
      {numeral}
    </Link>
  );
}
