const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Renders a number in Persian digits. Latin digits inside an otherwise Persian
 * interface read as a translation artefact, so any number the reader sees goes
 * through here.
 */
export function toFa(value: number | string): string {
  return String(value).replace(/\d/g, (d) => FA[Number(d)]);
}
