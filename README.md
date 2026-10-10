# DevStudio Portfolio #002 — Electrical Work Cost Calculator

[Live demo](https://devstudio-electrical-estimator-elbrus412365-1600.vercel.app) · [GitHub Actions](https://github.com/ShpakovskijV/devstudio-electrical-estimator/actions)

A practical **business demonstration project** for preparing electrical installation cost estimates. Built independently using illustrative data; **not a paid client project**.

## What it does

- Create and edit estimates with work, materials, transport and additional expenses.
- Calculate line totals, category subtotals, discounts, markups, taxes and final amounts.
- Manage a demo price catalog; edit quantities and unit prices.
- Switch between Ukrainian and English interfaces.
- Export polished PDF estimates with Ukrainian font support and page numbering.
- Export Excel XLSX with **live formulas**, including category totals and the grand total.
- Save data locally in the browser and download a JSON backup.

## Technology

React 19 · TypeScript · Vite · ExcelJS · jsPDF · Vitest · GitHub Actions · Vercel.

Core monetary calculations use integer kopecks to reduce floating-point errors. The demo uses local browser storage; there is no backend, authentication, multi-user collaboration or cloud synchronization.

## Run locally

```bash
npm install
npm run dev
npm run check:core
npm test
npm run build
```

## Verification

- GitHub Actions automated checks and production build passed for the deployed baseline.
- User tested the deployed desktop interface, fractional quantities, category totals and XLSX formulas. Editing 1.17 m to 2 m correctly updated the final amount to **8,400.00 UAH**.
- User inspected PDF exports: Cyrillic characters, localized units, totals, document footer and one-page numbering were correct. A subsequent PDF revision removed the negative sign on a zero discount and was visually confirmed.
- **Limitations:** multipage PDF layout, mobile usability, accessibility and cross-browser testing have not been fully validated. Example rates are not commercial quotations.

## Calculation order

Subtotal = sum of line totals. Discount is deducted from subtotal; markup is applied to the discounted amount; tax is applied after markup. The exported spreadsheet recomputes totals when line quantities or prices change.

## Portfolio use

This is an independently developed demonstration, not a completed Upwork contract. See the live demo for a working example of a lightweight business calculator.
