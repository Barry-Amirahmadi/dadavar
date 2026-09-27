/**
 * Content model — DADAVAR.
 *
 * These types are the contract between the UI and whatever supplies content.
 * Today the supplier is a set of TypeScript files under `src/content`; a CMS
 * later (docs/CMS-INTEGRATION-PLAN.md). Components read only these shapes.
 *
 * The one unusual thing here is `Inline`: prose is not a string but a list of
 * runs, because a paragraph can carry reference marks, and a reference mark is
 * a link with an identity of its own — the notes page links *back* to each one.
 * Modelling it as data rather than as markup inside a string is what lets that
 * back-reference list be derived instead of maintained by hand.
 */

/** Two ratios only. Plates in a book, not a gallery. */
export type Ratio = "3/2" | "1/1";

export interface MediaAsset {
  /** Root-relative path today, CMS asset URL later. */
  src: string;
  /** Describes the picture for someone who cannot see it. Never the filename. */
  alt: string;
  ratio: Ratio;
  width: number;
  height: number;
  caption?: string;
}

/** The three notes on /notes/. A reference mark can point at nothing else. */
export type NoteId = 1 | 2 | 3;

/** A run of prose: plain text, or a reference mark pointing at one note. */
export type Inline = string | { note: NoteId };

export type Paragraph = Inline[];

/**
 * One stretch of an essay between subheads.
 *
 * The body of a practice page is three of these rather than one long flow, and
 * that is a reading decision, not a data convenience: each segment is set as
 * its own two-column block, so a column is only ever a few lines tall and the
 * reader never has to scroll down one column and back up to start the next.
 */
export interface ProseSegment {
  /** Absent on the first segment, which opens under the standfirst. */
  heading?: string;
  paragraphs: Paragraph[];
}

export interface SeoFields {
  title: string;
  description: string;
}

export type GroupId = "contracts" | "companies" | "disputes";

export interface PracticeGroup {
  id: GroupId;
  /** Abjad letter — الف، ب، ج — the enumeration of a Persian legal text. */
  numeral: string;
  name: string;
}

export interface PracticeArea {
  slug: string;
  group: GroupId;
  /** 1–9. Rendered in Persian digits; counts the site's own content only. */
  number: number;
  title: string;
  /** One clause, ≤ 14 words, used wherever the area is listed. */
  clause: string;
  /** One sentence, ≤ 30 words, set larger than body and never in columns. */
  standfirst: string;
  /** The first two or three words of the body, set as the word-scale initial.
   *  They are removed from the first paragraph, not repeated. */
  lead: string;
  /** Exactly three segments; the second and third carry subheads. */
  body: ProseSegment[];
  /** The marginal aside, about 25 words. */
  marginal: string;
  /** Three of the nine pages carry a plate. The other six carry none. */
  image?: MediaAsset;
  /* No `seo` block: the route's title is `title` and its description is the
     standfirst, which is already one unique sentence per area. A second copy
     of either would be a second thing to keep in step. */
}

export interface Note {
  id: NoteId;
  title: string;
  lead: string;
  paragraphs: string[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteContent {
  brand: {
    name: string;
    latin: string;
    /** The line under the nameplate, and the colophon's one line. */
    line: string;
  };
  seo: {
    title: string;
    titleTemplate: string;
    description: string;
    ogImage: { src: string; alt: string; width: number; height: number };
  };
  /** The colophon's list of pages. The masthead carries the groups only. */
  pages: NavItem[];
  contact: {
    city: string;
    /** Display string, Persian digits. */
    phone: string;
    /** Dial string, Latin digits — Persian digits are not matched by \d. */
    phoneHref: string;
    /** WhatsApp number, Latin digits only. */
    whatsapp: string;
  };
  /** Says plainly, once, in the colophon, that the firm is fictional. */
  disclaimer: string;
  /** Copyright holder; the year is composed at build time in Persian digits. */
  copyrightName: string;
}

export interface CallToAction {
  heading: string;
  body: string;
  phoneLabel: string;
  whatsappLabel: string;
  /** Prefilled WhatsApp message, first person, no second person anywhere. */
  whatsappMessage: string;
}

export interface HomeContent {
  statementLead: string;
  statement: string[];
  areasLabel: string;
  areasAll: NavItem;
  quote: string;
  method: {
    numeral: string;
    heading: string;
    paragraphs: string[];
    image: MediaAsset;
  };
  cta: CallToAction;
  /** The two pages the masthead does not reach, linked from the home page. */
  onward: NavItem[];
}

export interface PracticeIndexContent {
  heading: string;
  standfirst: string;
  seo: SeoFields;
}

export interface NotesPageContent {
  heading: string;
  standfirst: string;
  image: MediaAsset;
  /** Heading of the back-reference list under each note. */
  backrefsHeading: string;
  seo: SeoFields;
}

export interface AboutContent {
  heading: string;
  standfirst: string;
  sections: { heading: string; body: string }[];
  image: MediaAsset;
  seo: SeoFields;
}

export interface NotFoundContent {
  heading: string;
  lead: string;
  actions: NavItem[];
}

/** Accessible names and the words the interface says on its own behalf. */
export interface UiStrings {
  skipToContent: string;
  nav: {
    groups: string;
    colophon: string;
    home: string;
  };
  practice: {
    /** Label over the two related areas. `{group}` is the group name. */
    related: string;
    allAreas: string;
    /** The line under a practice page's title. `{numeral}`, `{name}`. */
    kicker: string;
    /** Accessible name of the marginal note. */
    marginal: string;
  };
  refs: {
    /** Accessible name of a mark: `{n}` the note number, `{title}` its title. */
    mark: string;
    /** Accessible name of a back-reference: `{area}` the area title. */
    back: string;
  };
  newWindow: string;
  contactHeading: string;
  pagesHeading: string;
  groupsHeading: string;
}
