# dedupe-css-spec-header

Extract the 6-file `*-css.spec.js` header boilerplate in
`packages/themes` into a shared css-spec helper. Spec-only change.

Scan finding: dup-DC6 (duplication scan, >=3-use candidate).
Severity: Low (maintainability — spec-only, 6 files).

## Why

Six theme css specs repeat the same header
(read/declarations/STYLES + comments, `graph-css.spec.js:1-19` and 5
siblings). Header drift means specs silently test different things.

## What

- Add a shared css-spec helper under `packages/themes/spec/`
- Repoint all 6 specs (`graph`, `list-card`, `pill`, `screen-shell`,
  `stat-card`, `timeline`); keep every existing assertion
- No production-code change

Out of scope: other theme specs without this header.

## Evidence

- `packages/themes/spec/graph-css.spec.js:1-19` =
  `list-card`/`pill`/`screen-shell`/`stat-card`/`timeline-css.spec.js`
  headers
- Owner: `packages/themes`

## Impact

- Spec-only: identical assertions, one header implementation

## Risks

- **Assertion loss**: mitigate by matching per-file test counts
  before/after exactly.
