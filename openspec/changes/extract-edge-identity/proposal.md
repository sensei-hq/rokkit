# extract-edge-identity

Extract the 6-site routed-edge identity-fields pattern into one
`edgeIdentity(edge, i)` helper.

Scan finding: dup-DC4 (duplication scan, >=3-use candidate).
Severity: Low (maintainability — 6-site clone incl. an exact 21-line dupe).

## Why

The routed-edge identity-fields block exists in 6 places:
`flow.ts` and `radial.ts` carry an exact 21-line duplicate, plus inline
copies in `edges.ts` (x2), `structure.ts`, `layers.ts`, and `arcs.ts`.
Edge identity semantics currently have six owners.

## What

- Add `edgeIdentity(edge, i)` to a layout-shared module in
  `packages/graph/src/layout/`
- Repoint all 6 sites (`flow.ts`, `radial.ts`, `edges.ts` x2,
  `structure.ts`, `layers.ts`, `arcs.ts`); keep computed identity exact
- Add unit coverage pinning the identity output for representative edges

Out of scope: any other edge-field patterns not in this 6-site family.

## Evidence

- `packages/graph/src/layout/flow.ts::identity:73-82` (exact 21-line dupe)
- `packages/graph/src/layout/radial.ts::identity:167-176` (exact 21-line dupe)
- Inline copies: `edges.ts:34`, `edges.ts:104`, `structure.ts:311`,
  `layers.ts:125`, `arcs.ts:56`
- Owner: `packages/graph`

## Impact

- One helper owns edge identity; 6 sites delegate to it
- No behavioural change

## Risks

- **Inline-copy drift**: the 4 inline copies may differ slightly from the
  exact pair; mitigate by diffing each against the extracted helper and
  pinning outputs with unit specs before repointing.
