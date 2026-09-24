/**
 * The product's own shade, shown literally. Decorative on its own — the
 * category name always sits beside it — so it is hidden from assistive tech
 * rather than given a colour name no one asked for.
 */
export function ToneSwatch({ tone }: { tone: string }) {
  return <span className="tone-swatch" style={{ backgroundColor: tone }} aria-hidden="true" />;
}
