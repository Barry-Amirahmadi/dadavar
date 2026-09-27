import type { Metadata } from "next";
import Link from "next/link";
import { notesPage } from "@/content/pages";
import { noteAnchor, notes } from "@/content/notes";
import { backRefs } from "@/content/refs";
import { ui } from "@/content/ui";
import { Plate } from "@/components/Plate";
import { SectionOpener } from "@/components/SectionOpener";
import { toFa } from "@/lib/digits";
import { fill } from "@/lib/fill";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: notesPage.seo.title,
  description: notesPage.seo.description,
  path: "/notes/",
});

/**
 * Three notes on one page — the destination of every reference mark on the
 * site. One column at a wider measure than a practice page, because a note is
 * read straight through.
 *
 * Each note carries `id="note-N"` for the marks to land on, and a way back to
 * every mark that cites it; both ends come from `src/content/refs.ts`.
 */
export default function NotesPage() {
  return (
    <div className="wrap band">
      <header className="page-head">
        <SectionOpener numeral={toFa(notes.length)} title={notesPage.heading} level={1} />
        <p className="standfirst">{notesPage.standfirst}</p>
      </header>

      <Plate asset={notesPage.image} />

      {notes.map((note) => {
        const anchor = noteAnchor(note.id);
        const titleId = `${anchor}-title`;
        const [first, ...rest] = note.paragraphs;

        return (
          <article key={note.id} id={anchor} className="note" aria-labelledby={titleId}>
            <SectionOpener
              numeral={toFa(note.id)}
              title={note.title}
              level={2}
              size="sm"
              id={titleId}
              titleClassName="note-title"
            />

            <div className="note-body prose" data-prose="note">
              <p>
                <span className="initial">{note.lead}</span> {first}
              </p>
              {rest.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <nav className="backrefs" aria-labelledby={`${anchor}-backrefs`}>
              <h3 id={`${anchor}-backrefs`} className="backrefs-heading">
                {notesPage.backrefsHeading}
              </h3>
              <ul>
                {backRefs(note.id).map(({ area, mark }) => (
                  <li key={mark.id}>
                    <Link
                      href={`/practice/${area.slug}/#${mark.id}`}
                      aria-label={fill(ui.refs.back, { area: area.title })}
                    >
                      {area.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </article>
        );
      })}
    </div>
  );
}
