# DevStudio Portfolio #002 — Electrical Work Cost Calculator

Business Demo for electrical installation estimates. Ukrainian and English interface; editable catalog; saved estimates; PDF/XLSX export planned in the implementation phases.

## Architecture
- `src/core/estimate.ts`: CalcCore Lite / EstimateCore, integer kopecks, immutable line price snapshots
- `src/data/catalog.ts`: CatalogCore demo seed, editable prices in the UI
- `src/main.tsx`: application UI

## Pricing rules
Subtotal includes work, material, transport and extras. Discount applies to subtotal; markup applies to discounted amount; tax applies after markup. Each monetary stage rounds to the nearest kopeck. Prices are demonstrative, not market quotes.

## Local development
`npm install && npm run dev`; `npm test`; `npm run build`.

## Status
Development in progress. Do not claim GitHub/Vercel publication or exports verified until separately tested.
