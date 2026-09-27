# دادآور / DADAVAR

An editorial-authority site for a **fictional** Persian law firm — a design
demonstration, not a firm, and nothing on it is legal advice. RTL-first,
static export, GitHub Pages.

**Live:** https://barry-amirahmadi.github.io/dadavar/

## Routes

| Path | What it is |
|---|---|
| `/` | Nameplate, a two-column opening statement, the nine areas, one pull-quote, how the firm works |
| `/practice/` | Index — nine areas in three groups |
| `/practice/[slug]/` | One area as an essay: two columns, a word-scale initial, reference marks, a marginal note |
| `/notes/` | Three notes — where every reference mark lands, with a way back to each |
| `/about/` | The firm as an institution — no people, no founding year |

## Commands

```bash
npm ci
npm run dev            # http://localhost:3217
npm run build:pages    # static export under /dadavar
npm run preview:pages  # serve out/ the way Pages does, port 4417
npm run verify         # the measurement pass — contrast, line length, columns, red lines
npm run test:smoke     # Playwright smoke suite
npm run media          # regenerate the six placeholder plates
npm run og             # regenerate the share card
```

## Where things live

- Copy: `src/content/*.ts`, typed against `src/types/content.ts`.
- Design tokens: `src/app/tokens.css` — every colour pair measured.
- Grid placement: `src/components/cells.ts` — every cell names its row and column.
- Reference marks: `src/content/refs.ts` — marks and back-references from one walk.

## Images

Six placeholders in `public/media/` at the exact paths and ratios of the real
photographs, so replacing them is a file swap. No image contains a person.

Engine history: `docs/MASTER-HANDOFF.md` (§54 is this repository).
