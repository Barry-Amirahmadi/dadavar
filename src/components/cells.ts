import type { CSSProperties } from "react";

/**
 * Explicit grid placement, as CSS custom properties.
 *
 * Every cell in every grid on this site names its row *and* its column, at
 * every breakpoint. The reason is a defect the PARNIAN template shipped for
 * months: CSS Grid's sparse auto-placement cursor never moves backwards, so a
 * cell asking for an earlier column than one already placed is silently pushed
 * into a new implicit row — and the page still looks plausible, so nobody
 * notices. A marginal note beside a prose column is exactly that shape.
 *
 * `n` is the narrow layout (below 900px), `w` the wide one, and `m` the
 * middle band (900–1199px). `m` defaults to `w`, which is right for a grid
 * that splits at 900px; a grid that only splits at 1200px (the essay, the home
 * page's method band) must pass its narrow placement as `m` explicitly — the
 * first build did not, and the method band's plate was pushed into an implicit
 * second column at 1024px, squeezing its text to 8–19 characters a line. The stylesheet reads the matching pair of
 * custom properties in each band; `scripts/verify.mjs` prints what resolved.
 */
type Place = { row: number; col?: number };

export function cell(n: Place, w: Place, m: Place = w): CSSProperties {
  return {
    "--row-n": n.row,
    "--col-n": n.col ?? 1,
    "--row-m": m.row,
    "--col-m": m.col ?? 1,
    "--row-w": w.row,
    "--col-w": w.col ?? 1,
  } as CSSProperties;
}
