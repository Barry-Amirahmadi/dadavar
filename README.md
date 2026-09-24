# پرنیان / PARNIAN

RTL-first Persian cosmetics site — homepage, collection, product detail,
gallery and about/contact, statically exported. A template shown as a portfolio
piece, not a live storefront: there is no cart, no checkout and no payment, and
the contact numbers are deliberate placeholders.

```bash
npm install
npm run dev      # http://localhost:3210
npm run build
npm run typecheck
```

## Where things are

| Path | What it holds |
|---|---|
| `src/app/tokens.css` | **Every** colour, size, duration and easing. Nothing is hardcoded elsewhere. |
| `src/app/globals.css` | Cascade layers, typography, grid, motion, the ambient-shade signature. |
| `src/app/components.css` | Buttons, nav, gallery, lightbox, form surfaces. |
| `src/content/*.ts` | All copy and imagery. This is what a CMS would replace. |
| `src/types/content.ts` | The content contract. Components read only these shapes. |
| `src/components/` | `layout · navigation · hero · products · gallery · sections · ui · motion` |
| `scripts/generate-media.mjs` | Regenerates the placeholder "material studies" in `public/media`. |

## Content architecture

Content is modelled, not written into components. Every user-facing string and
every image on the site comes from `src/content/*.ts`, and every one of those
files is typed against an interface declared in `src/types/content.ts` — never
against a type inferred from the literal that happens to be there. Components
import the shapes, never a source.

That is the whole CMS story, and it is deliberately not a CMS. No headless
service is integrated here and none is planned: pointing this at Sanity, Strapi
or a headless WordPress is a per-collection **data-fetching** change — replace
the export in `src/content/`, satisfy the same interface — not a component
rewrite. The interfaces are the contract that makes that claim checkable rather
than aspirational.

Two details that make the difference in practice:

- **Authoring shape vs rendering shape.** `Product` is what an editor may save,
  with presentation fields optional; `ResolvedProduct` is what components
  receive, with those fields guaranteed. `resolveProducts()` is the only place
  a default lives, so no component carries a `?? fallback` for missing data.
- **Accessible names are content too.** `src/content/ui.ts` holds the interface
  strings — landmark names, the lightbox controls, the skip link. Text only a
  screen reader hears is still text an editor or a translator has to be able to
  reach.

## Three rules for anyone editing this

**1 — Never letter-space Persian.** It is a connected script; tracking severs
the joins. Only `.t-label` carries tracking, and only ever holds Latin text.

**2 — Put new classes in `@layer components`.** Unlayered classes outrank
Tailwind utilities, which is how `lg:hidden` silently stops working. The
cascade order is documented at the top of `globals.css`.

**3 — Direction is a variable, not a hardcoded side.** Use logical properties
(`ms-`, `me-`, `start-`, `end-`) for layout, and `--flow-start` for physical
transforms, which do not flip with `dir`. An English locale should be a change
to one declaration, not a rewrite.

## Replacing the placeholders

- **Copy** — every string is in `src/content`. Files marked `PLACEHOLDER
  CONTENT` contain no factual claim about a real business; all of it is meant
  to be overwritten. Nothing states an ingredient, a certification, a test
  result, a founding year or a price, because none was supplied — if you are
  filling this in for a real brand, those are fields to add, not blanks to
  guess at.
- **Photography** — drop real files at the same paths in `public/media` with
  the same aspect ratios. `EditorialImage` switches from pass-through to Next's
  optimizer automatically once the files are no longer SVG.
- **Contact details** — `src/content/site.ts`. `phone` is the display string in
  Persian digits; `phoneHref` is the dial string. They are separate fields on
  purpose.
