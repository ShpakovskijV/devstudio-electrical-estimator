# Portfolio #002 — Verification log

Date: 2026-10-10

## Verified
- Core calculation executed with Node.js 22 experimental TypeScript stripping.
- `node --experimental-strip-types scripts/check-core.mjs`: PASS (11 assertions).
- Checks include kopeck conversion, fractional quantity, invalid input, category totals, percentage rounding, catalog price snapshot.
- XLSX source now writes numeric quantity and unit price in separate columns (instead of an uneditable combined string).

## Not verified
- `npm install` did not complete in this environment (network timeout).
- Full TypeScript/Vite build, Vitest, browser UI, generated PDF and XLSX file opening remain unverified.
- Do not deploy to production or claim full acceptance before these checks pass.

## Reproduce
```
npm ci  # when package-lock.json is available; otherwise npm install
npm run build
npm test
node --experimental-strip-types scripts/check-core.mjs
npm run dev
```
Verify PDF Ukrainian glyphs, multi-page documents, Excel data columns and total, browser persistence and mobile layout.

## Stage 4 — 2026-10-10
- Re-ran offline core suite: **11 assertions passed** using `npm run check:core`.
- Found and corrected a TypeScript tuple inference error in `src/data/catalog.ts`.
- Added Vite client type declaration for `import.meta.env`.
- Corrected PDF line layout to advance for wrapped text and paginate per rendered line.
- `npm install` did not finish within available timeout; dependencies are not installed. Full TypeScript build, Vitest and browser/PDF/XLSX integration checks remain **unverified**.
- No GitHub/Vercel publication performed.

## Stage 5 — 2026-10-10
- Reproduced `npm install` failure: DNS `EAI_AGAIN` for registry.npmjs.org; no package-lock available.
- Confirmed 11 offline core assertions PASS.
- Hardened core against unsafe price/line total overflow.
- XLSX amount cells now include editable spreadsheet formulas with precomputed cached results.
- Browser, PDF/XLSX opening and Vite production build still NOT verified.
