# dedupe-icons-lib-index

Collapse the 8 byte-identical `packages/icons/lib/*/index.js` shims into one
shared module (or a generator fix, if they are generated).

Scan finding: dup-DC2 (duplication scan, >=3-use candidate).
Severity: Low (maintainability — 8 identical files).

## Why

`packages/icons/lib/*/index.js:1-9` are md5-identical across all 8 sets
(`app/auth/base/glyph/light/semantic/solid/twotone`, verified). No generator
template was found in `packages/cli/src`, so either a hand-maintained
8-way clone or output of external iconify tooling. Either way there should
be exactly one source of truth.

## What

- Determine whether the shims are generated (external iconify tooling) or
  hand-written
- If hand-written: extract one shared module imported by all 8 entries
- If generated: fix/add the generator or template instead of editing output
- Keep the published surface (`*.json` exports, real consumers) unchanged

Out of scope: the `lib/**` published-files question, which belongs to
`prune-dead-exports-and-shims`.

## Evidence

- `packages/icons/lib/{app,auth,base,glyph,light,semantic,solid,twotone}/index.js:1-9`
  — identical md5 `3638c1d7632e55f78477b989926734a7` (verified)
- Owner: `packages/icons` (+ `packages/cli/src` if a generator lives there)

## Impact

- One source of truth for the lib entry shim; 8 files become re-exports or
  generated output
- No consumer-visible change

## Risks

- **Unknown generator**: if external iconify tooling regenerates these,
  hand edits get clobbered; mitigate by resolving generated-vs-hand first
  (task 1) and fixing the generator in that case.
- **Nested package.json scope consumers**: in-repo evidence shows zero
  importers; keep entry paths working regardless.
