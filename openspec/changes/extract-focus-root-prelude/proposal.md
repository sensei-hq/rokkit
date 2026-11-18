# extract-focus-root-prelude

Extract the 3-site focus-root prelude in graph layouts into one
`resolveFocusRoot(model, options, name)` helper.

Scan finding: dup-DC3 (duplication scan, >=3-use candidate).
Severity: Low (maintainability — 3-site logic clone).

## Why

Three graph layouts repeat the same focus-root prelude
(`warnUnknownOptions` + `buildTree` + `findNode` + empty return). Option
validation and focus resolution now have three owners, so a fix in one
silently diverges the others.

## What

- Add `resolveFocusRoot(model, options, name)` to a layout-shared module in
  `packages/graph/src/layout/`
- Repoint the 3 call sites; keep return shapes and warning behaviour exact
- Add unit coverage for unknown-option warning, missing-node empty return,
  and resolved-root return

Out of scope: the 2-use near-misses (`compact`, `wedgeOf`/`clusterOf`
pairs) — fold them in only if they share the same new module naturally,
otherwise leave them (below the >=3 bar).

## Evidence

- `packages/graph/src/layout/structure.ts:409-417`
- `packages/graph/src/layout/sunburst.ts:129-137`
- `packages/graph/src/layout/world.ts:142-151`
- Owner: `packages/graph`

## Impact

- One helper owns focus-root resolution; 3 layouts delegate to it
- No behavioural change

## Risks

- **Subtle divergence**: the 3 preludes may differ in edge details; mitigate
  by diffing the three bodies line-by-line in the implementing PR and
  covering each branch with a unit spec.
