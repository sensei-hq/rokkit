# dedupe-matchmedia-setup

Collapse the 3 near-identical `matchMedia` spec-setup mocks into one
root-shared setup module. Spec-only change.

Scan finding: dup-DC7 (duplication scan, >=3-use candidate).
Severity: Low (maintainability — spec-only, 3 files).

## Why

`blocks/spec/setup.js:1-15`, `chart/spec/setup.js:1-15`, and
`graph/spec/setup.js:1-15` are near-identical (differ by one comment noun
plus a blank line). Three owners for one mock invite silent divergence.

## What

- Add one shared setup module (root spec helper or `config/`, following
  the repo's vitest setup convention) with the `matchMedia` mock
- Repoint the blocks, chart, and graph vitest setups at it
- Leave `states/spec/setup.js` alone — it is a different mock
  (localStorage stub), explicitly out of scope

Out of scope: any other per-package setup file.

## Evidence

- `packages/blocks/spec/setup.js:1-15`
- `packages/chart/spec/setup.js:1-15`
- `packages/graph/spec/setup.js:1-15`
- Owner: repo test config (`config/` / root vitest setup)

## Impact

- Spec-only: one mock implementation, three consumers

## Risks

- **Config wiring**: each package's vitest config must resolve the shared
  module; mitigate by running all three package suites after repointing.
