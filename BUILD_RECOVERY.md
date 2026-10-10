# Build recovery — 2026-10-10

## Root cause
The current execution container cannot resolve `registry.npmjs.org` (`getaddrinfo EAI_AGAIN`). This is an external DNS/network failure, not evidence of a TypeScript or Vite error. The npm cache contains no packages for this project.

## Alternative build path
`.github/workflows/verify.yml` runs `npm install`, the standalone calculation suite, Vitest and a production Vite build on GitHub-hosted Ubuntu. It uploads the `dist/` artifact only if all steps succeed. This route avoids relying on the current container's DNS, but requires the project to be pushed to GitHub.

## Status
- Offline core suite: PASS (11 assertions).
- Local `npm install`: BLOCKED by DNS EAI_AGAIN.
- Remote GitHub Actions run: NOT YET EXECUTED.
- Full build, Vitest, PDF/XLSX: NOT VERIFIED.

Once external npm access works, run `npm install`, commit the resulting `package-lock.json`, change workflow install step to `npm ci`, and rerun all checks. Do not deploy as verified before CI succeeds and PDF/XLSX files are inspected.


## 2026-10-10 follow-up
- Reconfirmed local npm registry DNS failure (`curl: (6) Could not resolve host: registry.npmjs.org`).
- GitHub account connection verified as `ShpakovskijV`. The proposed `ShpakovskijV/devstudio-electrical-estimator` repository does not yet exist (404).
- Current GitHub connector does not expose repository creation. Workflow cannot run until a repository is created and files pushed.
- Added npm fetch retries to CI workflow and safe-integer guards for category/subtotal/grand-total accumulation.
- No claim of a successful Vite build, Vitest run, PDF or XLSX integration test.
