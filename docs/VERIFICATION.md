# Verification — 10 October 2026

Repository: https://github.com/crynxmartinez/alfurqan

## Executed locally

| Check | Result | Evidence / limits |
| --- | --- | --- |
| Unit, component, permission and SQL tests | 41 passed in 9 files | `npm test`; includes teacher self-assignment, forbidden cross-teacher subject edits, unrelated student access, score validation/conflicts, failed-save retry, serialized edits, modal typing, password visibility, safe account responses, archive history and migration preservation. |
| TypeScript | Passed | `npm run typecheck`; operational scripts and seed are included. |
| Production build | Passed | `npm run build`; all routes compiled. Unreachable test database URLs were supplied explicitly, with stock-photo fetching disabled. |
| Lint | 0 errors, 7 warnings | Remaining warnings concern existing effect-driven state/loading patterns, not suppressed to claim a clean report. |
| Browser flow | 1 scenario passed | `npm run test:browser`; real Chromium, synthetic API records, no school database. Validates overview sorting, missing-grade order, print-button enablement/click, dark-mode report colors, 375/768/1440 px page widths, and an 18-column subject sheet. |
| Print/PDF | 3 landscape pages inspected | The test PDF contains 8 + 8 + 2 score columns, with both fixture students on every page. Repeated class/year/teacher metadata and table headers are visible. No automated comparison baseline exists. |
| SQL migration | Passed in isolated PostgreSQL engine | Existing synthetic school data is created using the baseline, then migrated. Tests confirm grade preservation, non-cascading foreign keys, archive/restore and the single-active-year constraint. Hosted PostgreSQL and production-sized backup tests remain separate release work. |
| Production dependencies | 0 reported vulnerabilities | `npm audit --omit=dev`. Compatible dependency fixes applied; Prisma's deepmerge dependency is overridden to the patched version and Prisma generate/build still pass. |
| Full dependency scan | 5 high, 0 critical remaining | The remaining advisory chain is braces → micromatch → fast-glob → Next ESLint plugin/config. npm proposes an incompatible lint-config downgrade; that forced downgrade was not applied. |
| Diff whitespace | Passed | `git diff --check`. |

## Inspectable examples

- [Sample class grade sheet PDF](previews/class-grade-sheet-sample.pdf)
- [Check Grades mobile screenshot](previews/check-grades-mobile.png)

Examples use fictitious students and classes only.

## Release boundary

After the implementation checks, the user authorized pushing and migrating. On 10 October 2026 the configured live database was backed up, the actual backup was restored and migrated in an isolated PostgreSQL engine, the live schema was confirmed against the baseline, and both migrations were recorded successfully. Every original row and field was compared after migration and remained unchanged. Live read-only checks passed for class sheets, student reports, owner access and unrelated-teacher denial. No demo seed or credential change was performed. Hosted login/write flows and deployment status remain separate checks.

Public grade lookup remains public as requested. There is no final-grade certification workflow; reports explicitly say provisional. Accessibility checks covered keyboard focus behavior and visual readability, not a complete screen-reader/WCAG audit. CI workflow changes were prepared but were not run on GitHub during this task.
