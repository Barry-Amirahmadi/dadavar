# PARNIAN — CMS integration plan

**Status:** plan only. Nothing in this document has been built.
**Written:** 2026-09-19, against commit `36e3e4f`.
**Scope:** what it takes to hand this template to a paying client who must be
able to add, edit and remove content without touching code — on their own
hosting and their own domain, not the GitHub Pages arrangement the demo uses.

---

## 1. The requirement, in the owner's words

> The template should be ready-made but its content changeable. When the client
> wants to add a product to the gallery, or edit a product, or delete its
> description, they should be able to. And when they add something new, a new
> page should be created that already carries the predefined design.

Three named things get confused in this area, so they are separated here once
and used precisely for the rest of the document:

| Term | What the client changes | Examples |
|---|---|---|
| **CMS** — content management system | **Data.** Products, gallery images, section copy. Layout and design are fixed | Sanity, Strapi, Contentful, the posts half of WordPress |
| **Page builder** | **Layout.** Drag blocks around, compose new pages, change the design | Elementor, Webflow, Divi |
| **Admin panel** | Nothing — it is the *container*, the logged-in screen the other two live inside | `wp-admin`, the Sanity Studio |

What the requirement describes is a **CMS**. No page builder is involved, and
§11 argues that shipping one would actively damage the product.

---

## 2. What already exists

Most of this is built. The parts below are stated with the file that proves
them, because the plan's cost estimate depends on them being true.

**Product pages already generate themselves.**
`src/app/products/[slug]/page.tsx` is a dynamic route whose
`generateStaticParams()` returns one entry per published product. Five products
in the data produce five pages today; a sixth produces `/products/<slug>/` with
the same layout, its own `<title>` and meta description, its own `schema.org`
Product block and its own related-products pair. Nothing about "a new page with
the predefined design" needs building — it is the existing mechanism.

**A draft state already exists.**
`Product.status` is `"published" | "draft"` and `publishedProducts` filters on
it, so a half-finished product simply has no page. That is the publish workflow
a client expects, already modelled.

**The content layer is already separated and fully typed.**
Nine modules under `src/content/` hold every string and image reference on the
site; no component hard-codes copy. Every export is declared against an explicit
interface in `src/types/content.ts` rather than inferred, which means a CMS
payload missing a required field fails the type check at build time instead of
rendering `undefined` into the page.

**Presentation fields are already optional with defined fallbacks.**
`tone` and `layout` are optional on `Product`, and `resolveProducts()` fills
them — `tone` from `FALLBACK_TONE`, `layout` from a cycle by index. This exists
specifically so an editor can save a product without making design decisions.
`Product` is the authoring shape; `ResolvedProduct` is the rendering shape.

**`MediaAsset.src` is already documented as "path today, CMS asset URL later."**

---

## 3. What is actually missing

Two things.

1. **An editing interface** — somewhere the client logs in and sees forms,
   instead of opening a `.ts` file.
2. **A publish trigger** — pressing "publish" has to cause a rebuild and a
   redeploy.

---

## 4. The constraint that shapes everything: client components read content directly

This is the finding that decides the approach, and it is the part most
integration plans skip.

Seven of the eleven client components import content modules directly:

```
src/components/gallery/Gallery.tsx
src/components/gallery/GalleryLightbox.tsx
src/components/gallery/GalleryTile.tsx
src/components/navigation/Header.tsx
src/components/navigation/MobileMenu.tsx
src/components/products/CollectionItem.tsx
src/components/products/ProductRow.tsx
```

A client component cannot fetch at build time. So "swap the data source for a
CMS call" is not a one-line change to the content modules — it forces one of
two routes:

**Route A — build-time codegen.** A `prebuild` script fetches from the CMS and
writes the content modules to disk. Every import in the app stays exactly as it
is, synchronous and typed. Component changes: **zero**.

**Route B — fetch in server components and pass down as props.** Pages become
async, and content travels through the tree to the seven client components as
props. Component changes: **substantial**, and several components would gain
props solely to relay data they currently import.

**Route A is the recommendation.** It matches the architecture the project
already has, it keeps the type check as the contract with the CMS, and it keeps
the entire build reproducible from a single fetch. Route B is only worth it if
the site later needs per-request data, which a brand catalogue does not.

A useful property of Route A: the generated modules can be committed or not.
Committing them means the repository always builds without CMS access, which is
worth having — the demo still works if the client's CMS subscription lapses.

---

## 5. Hosting: what changes once there is a real host and domain

GitHub Pages was a constraint of the demo, not a choice. With paid hosting:

**Option 1 — stay statically exported, host on Vercel or Netlify. Recommended.**
- `output: 'export'` stays. The site stays a folder of HTML.
- Client publishes → webhook → rebuild → redeploy. Measured on this repo today:
  **1m51s** end to end.
- Fast, effectively no attack surface, hosting cost normally zero at this scale.
- Cost: the CMS, see §8.

**Option 2 — drop the static export, run Next.js on Vercel with ISR.**
- Client publishes → on-demand revalidation → the page updates in seconds, with
  no full rebuild.
- Requires a running Node host, carries a monthly cost, and gives up the
  "nothing can break because nothing executes" property.
- Worth it only if the client genuinely needs near-instant updates — live stock
  levels, say. A brand catalogue does not.

**The two-minute delay must be disclosed to the client before sale, not
discovered after.** It is acceptable for a catalogue and unacceptable for
inventory; which one they are is their information to give.

---

## 6. Content model → CMS schema

Direct mapping from `src/types/content.ts`. Field names are kept identical so
the codegen step is a rename-free projection.

### `product` document

| Field | Type | Required | Editor control |
|---|---|---|---|
| `id` | string | ✅ | auto |
| `slug` | slug | ✅ | slug field, derived from `name`, editable |
| `name` | string | ✅ | text |
| `latin` | string | ✅ | text — used only for micro-labels |
| `category` | string | ✅ | select from existing categories |
| `description` | text | ✅ | one line, used in every listing |
| `statement` | text | — | detail page only |
| `body` | string[] | — | array of paragraphs; the editor controls the breaks |
| `details` | {label, value}[] | — | label/value rows, deliberately not a fixed schema |
| `tone` | color | — | colour picker; falls back to `FALLBACK_TONE` |
| `image` | `MediaAsset` | ✅ | see below |
| `layout` | enum tall/wide/compact/feature | — | falls back to a cycle by index |
| `status` | published \| draft | ✅ | the publish switch |
| `seo.title`, `seo.description` | string | — | collapsed "advanced" group |

### `galleryItem` document

`id`, `title`, `category`, `caption?`, `image`, `order` — exactly
`GalleryItem`. `order` is the manual sort position.

### `mediaAsset` object

`src`, `alt` (**required** — it is the accessibility contract, not a nicety),
`ratio`, `caption?`.

`ratio` should be a **fixed select, not free text**, and the catalogue options
should be `4/5` only, with the wide `8/5` reserved for the feature product. The
reason is recorded in the header comment of `src/content/products.ts`: a
catalogue whose frames vary per product reads as mismatched photography, and a
template that demands several ratios forces a client to crop one consistent set
of photographs several different ways.

### Section copy

`sections.ts` is a copy deck — hero, statement, showcase, collection, brand,
values, gallery, about, contact, cta, notFound. In the CMS this is one
**singleton document per section**, not a collection. `ui.ts` (interface strings
— button labels, aria labels) should **stay in code**: it is not content, and
exposing it lets a client rename a form control into an accessibility defect.

---

## 7. Work plan

| # | Step | Touches |
|---|---|---|
| 1 | Define the schemas in the CMS from §6 | new files, CMS side |
| 2 | Seed the CMS with the five products, six gallery items and the section copy | one-time import script |
| 3 | Write `scripts/fetch-content.mjs` — fetch, validate against the types, write `src/content/*.ts` | new file |
| 4 | Wire it as `prebuild` | `package.json` |
| 5 | Validation gate: fail the build loudly on a missing required field, rather than emitting a broken page | `scripts/fetch-content.mjs` |
| 6 | Image pipeline: CMS asset URLs are absolute and remote, so `withBasePath()` must not prefix them | `src/lib/basePath.ts` |
| 7 | `images.unoptimized` stays `true` under static export — the CMS's own CDN transform does the resizing | `next.config.ts` |
| 8 | Webhook: CMS publish → deploy hook → rebuild | CMS + host |
| 9 | Persian-language Studio, so the client sees Persian field labels | CMS config |
| 10 | Smoke test extension: assert every published product has a page and a non-empty `alt` | `tests/smoke.spec.ts` |

Step 6 is the one easy to miss. `withBasePath()` exists because static export
does not prefix image `src` with the deployment base path; a remote CMS URL must
be passed through untouched or it becomes `/cosmetics/https://cdn…`.

Step 10 matters more than it looks: once a non-developer can publish, the build
is the only thing standing between a missing `alt` and a live accessibility
defect.

---

## 8. Cost and effort

**Effort.** Roughly 2–4 focused days for steps 1–10, most of it in steps 3 and
5. Route A is cheap precisely because no component changes.

**Recurring cost.** Sanity's free tier covers a catalogue this size; the paid
tier starts around the price of a cheap hosting plan and is per-project.
Vercel/Netlify hosting for a static export of this size is normally free.
Domain is the client's. **Confirm current pricing before quoting a client — the
numbers here are from general knowledge, not a checked price list.**

---

## 9. What the client sees

1. Logs in to a panel with Persian field labels.
2. Sidebar: محصولات · گالری · متن‌های صفحه.
3. Opens محصولات, sees the list, presses "+ new product".
4. Fills a form with exactly the fields the design needs — no more, no fewer.
5. Drags in an image, presses publish.
6. About two minutes later `theirdomain.com/products/<slug>/` is live, carrying
   the same design as every other product page.

Editing and deleting are the same screen. A product set back to `draft`
disappears from the site at the next build.

---

## 10. Decisions the owner must make before this is built

1. **Which CMS.** Sanity is the default recommendation: hosted, free at this
   size, good image CDN, schemas are code so they version with the repo.
   Decap/Netlify CMS avoids a subscription by writing to the Git repo, but
   authenticates through a GitHub account, which is a poor experience to hand a
   business owner.
2. **Option 1 or Option 2 from §5** — two-minute rebuild, or a running server.
3. **Whether generated content modules are committed.** Recommended: yes.
4. **Whether the client may create arbitrary pages.** See §11.
5. **Who holds the CMS account and who pays for it** — this is a support and
   billing question, not a technical one, and it is the one most likely to cause
   an argument a year later.

---

## 11. What this plan deliberately does not do

**It does not add a page builder.**

"A new page" means two different things and they must not be conflated:

- **A new product page** — automatic, already working, costs nothing.
- **A new arbitrary page** such as "shipping terms" or "our story" — different
  problem.

If the client needs the second, the answer is a single flexible page template
with a **closed set** of pre-designed blocks — heading+text, text+image, a list
of points — where the client controls order and content but not colour, type or
spacing. Not a general builder.

The selling point is the restriction, and it should be sold as one: the client
gets full control of content while the design stays locked, so the site is as
coherent a year later as it was on delivery. Anyone who has seen a page-built
site age understands the value immediately.

---

## 12. Open questions

- Persian slugs: `/products/سرم-شب/` or transliterated `/products/shab/`? The
  seed data uses transliteration. Changing it later breaks URLs.
- Who writes `alt` text, and how is the client held to it? The build can require
  it to be non-empty; it cannot require it to be accurate.
- Does the client need more than one editor account, with roles?
- Adding a category today means adding a product with a new `category` string;
  `collectCategories()` derives the index from the products. If categories need
  their own descriptions or ordering, they become a document type of their own.
