# Export implementation — Stage 2

- PDF generated with jsPDF and embedded Go Regular Unicode TTF for Ukrainian text; automatic page breaks.
- XLSX generated with ExcelJS, numeric UAH totals and formatted summary.
- Export uses immutable line price snapshots; catalog changes do not alter existing lines.
- Demo data remains browser-local. PDF/XLSX files are generated client-side.
- Dependencies must be installed with `npm install` before `npm run build` / `npm test`.
- Runtime smoke test of PDF/XLSX download remains pending until dependency installation is available.
