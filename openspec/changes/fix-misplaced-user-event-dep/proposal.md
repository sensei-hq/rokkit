# fix-misplaced-user-event-dep

Move `@testing-library/user-event` from root devDependencies to
`packages/forms` devDependencies, where its only consumers live.

Scan finding: dead-D10 (dead-code scan, misplaced dep — move, not delete).
Severity: Low (correctness of manifests — load-bearing phantom dep).

## Why

Forms specs (e.g. `InputText.spec.svelte.js:3`) import
`@testing-library/user-event`, but `packages/forms` does not declare it —
today it resolves only as a phantom dep via the root manifest
(re-verified: 3 importing spec files, no declaration in forms). Deleting
it from root without adding it to forms would break the forms suite; the
correct fix is an atomic move.

## What

- Add `@testing-library/user-event` (same version) to
  `packages/forms/package.json` devDependencies
- Remove it from root `package.json` devDependencies
- Regenerate `bun.lock` accordingly

Out of scope: all other manifest entries.

## Evidence

- `packages/forms/spec/input/InputText.spec.svelte.js:3` (plus
  `InputNumber`, `InputRange` specs) import `user-event`; forms manifest
  lacks the declaration (re-verified)
- Owner: `packages/forms` maintainer (+ root manifest)

## Impact

- Forms specs declare what they use; root manifest loses a phantom entry
- No code change

## Risks

- **Version drift**: pin the same version in the move; mitigate by
  diffing the resolved lockfile entry before/after and running the forms
  suite plus frozen install.
- **Other phantom consumers**: mitigate by grepping the whole repo for
  `user-event` imports and confirming forms is the only consumer before
  removing the root entry.
