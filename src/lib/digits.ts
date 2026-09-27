const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Renders digits in a string as Persian digits. Latin digits inside an
 * otherwise Persian interface read as a translation artefact.
 */
export function toFa(value: number | string): string {
  return String(value).replace(/\d/g, (d) => FA[Number(d)]);
}

/**
 * A number in Persian digits, **without grouping**.
 *
 * `useGrouping: false` is the point. A bare `toLocaleString("fa-IR")` renders
 * 2026 as ۲٬۰۲۶, with a thousands separator inside a year — the copyright line
 * is exactly where that shows, and `scripts/verify.mjs` checks it.
 */
const fa = new Intl.NumberFormat("fa-IR", { useGrouping: false });

export function faNumber(value: number): string {
  return fa.format(value);
}
