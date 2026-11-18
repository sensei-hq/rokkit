# prune-dead-exports-and-shims

Drop shipped-but-unreachable icons shims from the published files, delete
unimported constants and dead exports, and un-export intra-file helpers.

Scan findings: dead-D14, dead-D15, dead-D16, dead-D17 (dead-code scan,
safe removals).
Severity: Low (hygiene — verified zero-importer removals).

## Why

The repo ships dead weight and advertises API surface nobody uses: icons
`lib/*/index.js` CJS shims ride the published `files` while every real
consumer uses `*.json`; `packages/states` exports constants nothing
imports from a module outside the index; learn/graph carry
definition-only exports; and a dozen helpers are exported although only
their own file uses them.

## What

- `packages/icons`: exclude `lib/**` shims (`index.js`, `index.mjs`,
  `index.d.ts`, nested `package.json`) from published `files` (keep
  source in-repo); see Risks before deleting source
- `packages/states/src/constants.js`: delete `DEFAULT_EVENTS`,
  `DEFAULT_VIBE_OPTIONS`, `DEFAULT_VIBE_PALETTE`
- Delete dead exports: `match.svelte.ts::isStrongMatch,nextSuggestions`,
  `contrast-collector.mjs::AA_NORMAL,AA_LARGE`,
  `graph/spec/fixtures.ts::SCHEMA_FIELDS_LITE`
- Un-export intra-file helpers: `data/view.js::groupSort,toggleSelection`,
  `data/rollup.js::initialValues,addToSummaries`,
  `data/dataset.js::defaultAggregator`, `radar.js::MICRO_MIN,MAX_AXES`,
  `preset.js::PRINT_PRESET`, `OrientationState.svelte.js::CATEGORICAL_X`,
  `layers.ts::deriveConformance`, `sparkline/store.svelte.ts::SparklineStore`,
  `chat-demo/intent/docs.ts::docSections`,
  `contrast-collector.mjs::ALLOW`

Out of scope: test-only modules needing a maintainer call (D13) and the
shim-dedup question (`dedupe-icons-lib-index`).

## Evidence

- D14 `packages/icons/lib/*/index.{js,mjs}` — zero in-repo importers;
  parent exports map exposes only `*.json` (real consumers: unocss
  `shortcuts.js:27-29`, `config.js:25`). Verify: `rg -ln
  'icons/lib/(base|app|auth|glyph|light|semantic|solid|twotone)/index'
  packages/ apps/`
- D15 `packages/states/src/constants.js::DEFAULT_EVENTS,
  DEFAULT_VIBE_OPTIONS,DEFAULT_VIBE_PALETTE` — unimported, module not in
  index (sibling `VALID_*`/`DEFAULT_STYLES` used by `vibe.svelte.js:6` —
  keep). Verify: `rg -ln
  'DEFAULT_EVENTS|DEFAULT_VIBE_OPTIONS|DEFAULT_VIBE_PALETTE' packages/
  apps/learn/src`
- D16 `apps/learn/src/lib/koan/match.svelte.ts::isStrongMatch,
  nextSuggestions` (only `runMatch` used); `apps/learn/e2e/
  contrast-collector.mjs::AA_NORMAL,AA_LARGE` (def-only lines 27-28);
  `packages/graph/spec/fixtures.ts::SCHEMA_FIELDS_LITE` (def-only line
  193). Verify: `rg -ln 'isStrongMatch|nextSuggestions' apps/learn/src
  apps/learn/spec`; `rg -n 'AA_' apps/learn/e2e/contrast-collector.mjs`
- D17 helpers listed above (each single-file use). Verify per symbol,
  e.g. `rg -n 'MICRO_MIN_AXES'
  packages/chart/src/geoms/lib/marks/radar.js`
- Owners: `packages/icons`, `packages/states`, `packages/data`,
  `packages/chart`, `packages/graph`, `apps/learn` maintainers

## Impact

- Smaller published icons payload; smaller advertised API surface; no
  behavioural change

## Risks

- **External deep-import of icons shims**: in-repo evidence shows zero
  use and the parent exports map blocks the path, but external consumers
  of the nested `package.json` scope cannot be ruled out from inside the
  repo — hence exclude-from-`files` first, delete source only with
  maintainer sign-off.
- **Knip-false-positive overlap**: D24 verified live symbols stay; each
  deletion re-runs its verify grep plus packaging (`svelte-package` /
  publint-style check) and the full suite.
