import type { UiStrings } from "@/types/content";

/**
 * Interface strings — accessible names, and the few words the interface says
 * on its own behalf. Kept out of the components for the same reason the copy
 * is: a string a component hardcodes is one no editor and no translator can
 * reach, and most of these are heard rather than seen.
 */
export const ui: UiStrings = {
  skipToContent: "پرش به متن اصلی",

  nav: {
    groups: "گروه‌های کاری",
    colophon: "صفحه‌های سایت",
    /** Follows the brand name: «دادآور، صفحه‌ی نخست». */
    home: "صفحه‌ی نخست",
  },

  practice: {
    related: "دیگر حوزه‌های گروه {group}",
    allAreas: "همه‌ی حوزه‌های کاری",
    kicker: "گروه {numeral}: {name}",
    marginal: "حاشیه",
  },

  refs: {
    mark: "یادداشت {n}: {title}",
    back: "بازگشت به ارجاع در صفحه‌ی {area}",
  },

  newWindow: "در پنجره‌ی تازه باز می‌شود",
  contactHeading: "تماس",
  pagesHeading: "صفحه‌ها",
  groupsHeading: "گروه‌ها",
};
