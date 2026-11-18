# dedupe-input-spec-factory

Extract the ~14-file input-spec boilerplate blocks in `packages/forms`
into a shared spec factory. Spec-only change.

Scan finding: dup-DC5 (duplication scan, >=3-use candidate).
Severity: Low (maintainability — spec-only, ~14 files).

## Why

Input specs repeat two boilerplate blocks verbatim: block A
(`InputCheckbox.spec:26-40`, shared with Date/File/Number/Range/Text/
TextArea) and block B (`InputColor.spec:32-43`, shared with DateTime/
Email/Month/Password/Tel/Time/Url/Week). Every input-behaviour change
must be edited across ~14 spec files.

## What

- Add a shared input-spec factory (e.g. under
  `packages/forms/spec/input/`) covering both blocks with per-input
  parameters
- Repoint all ~14 input specs at the factory; keep every existing
  assertion and case
- No production-code change

Out of scope: production input components; any spec file outside the
two boilerplate blocks.

## Evidence

- Block A: `packages/forms/spec/input/InputCheckbox.spec.svelte.js:26-40`
  = Date/File/Number/Range/Text/TextArea specs
- Block B: `packages/forms/spec/input/InputColor.spec.svelte.js:32-43` =
  DateTime/Email/Month/Password/Tel/Time/Url/Week specs
- Owner: `packages/forms`

## Impact

- Spec-only: suite stays green with identical assertions, less text
- Future input-behaviour changes touch one factory, not ~14 files

## Risks

- **Assertion loss**: repointing could silently drop a case; mitigate by
  diffing the test-count per file before/after (`vitest --reporter=basic`
  totals must match exactly).
