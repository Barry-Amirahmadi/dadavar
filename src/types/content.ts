/**
 * Content model.
 *
 * These types are the contract between the UI and whatever supplies content.
 * In Phase 01 the supplier is a set of TypeScript files under `src/content`.
 * In Phase 02 it becomes a CMS. The components never change: they already read
 * only from these shapes, and every field below maps to a CMS field.
 */

/** Fixed aspect ratios. Crops are part of the art direction, not per-image
 *  guesswork — an editor picks one, never a raw pixel size. */
export type Ratio = "1/1" | "4/5" | "3/4" | "4/3" | "8/5" | "16/9";

export interface MediaAsset {
  /** Path today, CMS asset URL later. */
  src: string;
  /** Describes the picture for someone who cannot see it. Never the filename. */
  alt: string;
  ratio: Ratio;
  /** Optional editorial caption shown under or over the image. */
  caption?: string;
}

/**
 * How a product occupies the showcase grid. The layout is content, not code:
 * an editor sequencing the page decides the rhythm, so the spread stays
 * designed rather than becoming a repeating row component.
 */
export type ProductLayout = "tall" | "wide" | "compact" | "feature";

export interface Product {
  id: string;
  /** URL segment — /products/[slug] in Phase 02. */
  slug: string;
  /** Persian product name. */
  name: string;
  /** Latin transliteration, used only for micro-labels. */
  latin: string;
  /** Persian category label, e.g. سرم. Drives filtering later. */
  category: string;
  /** Short Persian description — one line, used wherever the product is listed. */
  description: string;
  /**
   * Detail-page copy. All optional: a product can be published with nothing but
   * the fields above, and the detail page degrades to the listing copy.
   *
   * These are *editorial copy*, the same class of field as `description` — not
   * product attributes. There is deliberately no `ingredients`, `volume`,
   * `price` or `skinType` here: no such information has been supplied, and
   * inventing it is exactly what §44.1 forbids.
   */
  statement?: string;
  /** Body paragraphs. An array so the editor controls the breaks, not a regex. */
  body?: string[];
  /**
   * Key information, as label/value pairs rather than a fixed schema.
   *
   * Every value on the five seed products is restated from that product's own
   * `description` — nothing here asserts anything the brand had not already
   * said. The list is intentionally uneven between products: where the copy
   * never stated a time of day, that row is simply absent rather than filled in
   * to make the table look complete.
   */
  details?: { label: string; value: string }[];
  /**
   * The product's own shade, driving the ambient wash behind the showcase.
   * Optional because a CMS editor can save a product without picking one —
   * see resolveProducts() for what happens then.
   */
  tone?: string;
  image: MediaAsset;
  /** Optional for the same reason as `tone`. */
  layout?: ProductLayout;
  status: "published" | "draft";
  seo?: {
    title?: string;
    description?: string;
  };
}

/**
 * A product with every presentation field guaranteed to be present.
 *
 * This is what components consume. `Product` is the *authoring* shape, where
 * presentation fields may be absent; `ResolvedProduct` is the *rendering*
 * shape, where they never are. Keeping the two separate means no component
 * ever carries a `?? fallback` for a missing field, and the defaulting rules
 * live in exactly one place.
 */
export interface ResolvedProduct extends Product {
  tone: string;
  layout: ProductLayout;
}

export interface GalleryItem {
  id: string;
  title: string;
  /** Persian category label — the axis a future gallery filter uses. */
  category: string;
  caption?: string;
  image: MediaAsset;
  /** Manual sort position, as an editor would set it. */
  order: number;
}

export interface ValueItem {
  id: string;
  title: string;
  body: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteContent {
  brand: {
    name: string;
    latin: string;
    /** One line, used in the footer and as the meta description base. */
    line: string;
  };
  /**
   * Document-level metadata for the site as a whole. Per-route titles live on
   * the section that owns the route; these are the default and the wrapper.
   */
  seo: {
    /** The homepage <title>, and the fallback for any route without its own. */
    title: string;
    /** `%s` is the route's own title. */
    titleTemplate: string;
    /** The homepage meta description. Longer than `brand.line`, which is a
     *  display string and too short to be a useful search snippet. */
    description: string;
    /** The share card. `src` is root-relative; the absolute URL is composed
     *  at build time, because Open Graph requires one. */
    ogImage: { src: string; alt: string; width: number; height: number };
  };
  nav: NavItem[];
  headerCta: NavItem;
  contact: {
    city: string;
    /** Display string, in Persian digits. */
    phone: string;
    /** Dial string, in Latin digits. Kept separate: Persian digits are not
     *  matched by \d, so a tel: href cannot be derived from `phone`. */
    phoneHref: string;
    /** WhatsApp click-to-chat number, Latin digits only, no punctuation. */
    whatsapp: string;
    email: string;
    /** Secondary inquiry path (§42). `handle` is what a reader sees. */
    instagram: { handle: string; href: string };
  };
  social: NavItem[];
  legal: NavItem[];
  /** Column headings in the footer. Brand copy, not structure. */
  footer: {
    navHeading: string;
    contactHeading: string;
  };
  copyright: string;
}

/* -------------------------------------------------------------------------- */
/*  Section copy                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Every band and every page opens the same way: a micro-label, a heading, and
 * a lead paragraph. Declared once here so the shape is a contract rather than
 * a convention the next section might quietly not follow.
 */
export interface SectionIntro {
  /** Micro-label above the heading. */
  eyebrow: string;
  heading: string;
  lead: string;
}

/** Per-route metadata, on the section that owns the route. */
export interface SeoFields {
  title: string;
  description: string;
}

export interface HeroContent extends SectionIntro {
  primary: NavItem;
  secondary: NavItem;
  scrollHint: string;
  image: MediaAsset;
  inset: MediaAsset;
  insetCaption: string;
}

export interface StatementContent {
  text: string;
  attribution: string;
}

export interface ShowcaseContent extends SectionIntro {
  /** Label on each product's link out of the showcase. */
  linkLabel: string;
  /** The way out of the narrative cut and into the full collection. */
  allLabel: string;
  allHref: string;
}

export interface CollectionContent extends SectionIntro {
  /** Accessible name of the category index, which is a navigation landmark. */
  indexLabel: string;
  /** Accessible name of the product list itself. */
  listLabel: string;
  /** Follows the rendered product count, e.g. «۵ محصول». */
  countLabel: string;
  seo: SeoFields;
}

export interface ProductPageContent {
  detailsHeading: string;
  relatedEyebrow: string;
  relatedHeading: string;
  backLabel: string;
  breadcrumbHome: string;
  breadcrumbCollection: string;
  breadcrumbLabel: string;
}

export interface InquiryContent {
  label: string;
  /** `{product}` is substituted with the product name at render time. */
  message: string;
  /** The same channel with no product in hand — the about page. */
  generalLabel: string;
  generalMessage: string;
  /** Appended for screen readers to any link that leaves the site. */
  newWindow: string;
}

export interface BrandContent extends SectionIntro {
  image: MediaAsset;
}

export interface GalleryContent extends SectionIntro {
  /** Accessible name of each tile's zoom button, on both gallery surfaces. */
  viewLabel: string;
  allLabel: string;
  allHref: string;
}

export interface GalleryPageContent extends SectionIntro {
  seo: SeoFields;
}

export interface AboutContent extends SectionIntro {
  /** Body paragraphs. An array so the editor controls the breaks. */
  body: string[];
  image: MediaAsset;
  seo: SeoFields;
}

export interface ContactContent extends SectionIntro {
  instagramLabel: string;
  /** Row labels of the direct-details list. */
  labels: { city: string; phone: string; email: string };
}

/** Not a `SectionIntro`: this band carries a body paragraph, not a lead. */
export interface CtaContent {
  eyebrow: string;
  heading: string;
  body: string;
  primary: NavItem;
  secondary: NavItem;
  image: MediaAsset;
}

export interface NotFoundContent {
  eyebrow: string;
  heading: string;
  lead: string;
  action: NavItem;
}

/* -------------------------------------------------------------------------- */
/*  Interface strings                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Accessible names, and the few words the interface says on its own behalf
 * rather than the brand's.
 *
 * These are modelled for the same reason the copy deck is: §28 has no exception
 * for text only a screen reader hears, and a string a component hardcodes is a
 * string no editor and no translator can reach. Part of this set was already in
 * the copy deck — `collection.indexLabel`, `productPage.breadcrumbLabel`,
 * `inquiry.newWindow` — so the question was never whether these belong in
 * content, only whether the rule was applied evenly. It is now.
 */
export interface UiStrings {
  /** First focusable element on every page. */
  skipToContent: string;
  nav: {
    /** Accessible name of the header's navigation landmark. */
    primary: string;
    footer: string;
    /** Trailing half of the wordmark's accessible name, after the brand name. */
    home: string;
    openMenu: string;
    closeMenu: string;
    /** The mobile panel is a dialog and needs its own name. */
    menuDialog: string;
  };
  gallery: {
    lightbox: string;
    close: string;
    previous: string;
    next: string;
    /** Joins position and total, e.g. «۳ از ۶». */
    counterJoin: string;
  };
}
