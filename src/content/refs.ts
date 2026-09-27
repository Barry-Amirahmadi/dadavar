import type { NoteId, PracticeArea } from "@/types/content";
import { areas } from "./practice";

/**
 * Reference marks, numbered once, in one place.
 *
 * Twenty-one marks across nine pages point at three notes, so a note cannot
 * have *one* return link — it would not know which page the reader came from.
 * Instead every mark gets its own id, and each note lists a way back to every
 * mark that cites it. Both directions are derived from `annotate` below, so the
 * page that renders a mark and the page that links back to it cannot disagree
 * about its id.
 */

export interface MarkRef {
  note: NoteId;
  /** Element id of the mark on its practice page. */
  id: string;
  /** 1-based position of the mark on its page. */
  ordinal: number;
}

export interface BackRef {
  area: PracticeArea;
  mark: MarkRef;
}

/** A run of an annotated paragraph: text, or a numbered mark. */
export type Run = string | MarkRef;

export interface AnnotatedSegment {
  heading?: string;
  paragraphs: Run[][];
}

export function markId(slug: string, ordinal: number): string {
  return `ref-${slug}-${ordinal}`;
}

/** An area's body with every `{ note }` replaced by its numbered mark. */
export function annotate(area: PracticeArea): AnnotatedSegment[] {
  let ordinal = 0;
  return area.body.map((segment) => ({
    heading: segment.heading,
    paragraphs: segment.paragraphs.map((paragraph) =>
      paragraph.map((run): Run => {
        if (typeof run === "string") return run;
        ordinal += 1;
        return { note: run.note, id: markId(area.slug, ordinal), ordinal };
      }),
    ),
  }));
}

/** Every mark on one page, in reading order. */
export function marksOf(area: PracticeArea): MarkRef[] {
  return annotate(area)
    .flatMap((segment) => segment.paragraphs.flat())
    .filter((run): run is MarkRef => typeof run !== "string");
}

/** Every mark on the site that cites one note, in area order. */
export function backRefs(note: NoteId): BackRef[] {
  return areas.flatMap((area) =>
    marksOf(area)
      .filter((mark) => mark.note === note)
      .map((mark) => ({ area, mark })),
  );
}
