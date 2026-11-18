# prune-unused-deps-chart-forms-cli

Remove zero-import dependencies from the chart, forms, and cli package
manifests, and fix the stale chart README listing.

Scan findings: dead-D1, dead-D2, dead-D3 (dead-code scan, safe removals).
Severity: Low (hygiene — verified zero-import removals).

## Why

Three package manifests declare dependencies nothing imports: chart
carries `@rokkit/states`, `d3-axis`, and `d3-transition` (+ types);
forms carries `ramda` (+ types); cli carries `@mdi/svg`, `@iconify/types`,
and `iconify`. Each one slows installs, widens the supply chain, and
misleads readers about what the package needs. Chart's README repeats the
stale listing.

## What

- `packages/chart/package.json`: drop deps `@rokkit/states`, `d3-axis`,
  `d3-transition` and devDeps `@types/d3-axis`, `@types/d3-transition`;
  update `README.md:167-168` to match
- `packages/forms/package.json`: drop dep `ramda` and devDep
  `@types/ramda` (only `fields.js` comments mention ramda)
- `packages/cli/package.json`: drop deps `@mdi/svg`, `@iconify/types`
  and devDep `iconify` (`convert.js` uses only `@iconify/tools`)
- Regenerate `bun.lock` accordingly

Out of scope: the misplaced (not unused) `user-event` dep, which belongs
to `fix-misplaced-user-event-dep`; verified-live deps in finding D24.

## Evidence

- D1 `packages/chart/package.json::deps[@rokkit/states,d3-axis,d3-transition]`
  + devDeps `[@types/d3-axis,@types/d3-transition]` — zero imports in
  `src/spec/browser` (dep lists re-verified in manifests); README:167-168
  stale. Verify: `rg -ln 'd3-axis|d3-transition|@rokkit/states'
  packages/chart/src packages/chart/spec packages/chart/browser`
- D2 `packages/forms/package.json::deps[ramda]` + devDeps `[@types/ramda]`
  — no import (re-verified: zero hits). Verify: `rg -n "from
  ['\"]ramda|require\(.ramda" packages/forms/src packages/forms/spec`
- D3 `packages/cli/package.json::deps[@mdi/svg,@iconify/types]` +
  devDeps `[iconify]` — zero refs (dep list re-verified). Verify: `rg -ln
  '@mdi/svg|@iconify/types|from .iconify' packages/cli/src packages/cli/spec`
- Owners: `packages/chart`, `packages/forms`, `packages/cli` maintainers

## Impact

- Smaller manifests and lockfile; faster installs; docs match reality
- No code change beyond manifests, lockfile, and one README hunk

## Risks

- **Phantom-deep-import**: a consumer could deep-import a dropped dep
  through the package (none found in-repo); mitigate by re-running the
  verify greps plus the full test suite and frozen install before merge.
