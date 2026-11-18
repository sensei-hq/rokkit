# prune-unused-root-learn-app-deps

Remove zero-reference dependencies from the root, learn-app, and app
package manifests.

Scan findings: dead-D4, dead-D5, dead-D6, dead-D7, dead-D8, dead-D9
(dead-code scan, safe removals).
Severity: Low (hygiene — verified zero-reference removals).

## Why

Six manifest entries have no live reference: root `dompurify` (blocks+ui
declare their own), learn's `@fontsource/open-sans`/`overpass`,
`@mlc-ai/web-llm` (the app loads a pinned CDN build instead),
`@iconify-json/mdi` (docs snippet only), and `@vitest/browser` (redundant
with root; learn has no `browser/` dir), plus app's `playwright`,
`@testing-library/jest-dom`, and `@testing-library/user-event`.

## What

- Root `package.json`: drop dep `dompurify`
- `apps/learn/package.json`: drop deps `@fontsource/open-sans`,
  `@fontsource/overpass`, `@mlc-ai/web-llm`; drop devDeps
  `@iconify-json/mdi`, `@vitest/browser`
- `packages/app/package.json`: drop devDeps `playwright`,
  `@testing-library/jest-dom`, `@testing-library/user-event` (keep
  `@vitest/browser` — used via `vitest/browser` import)
- Regenerate `bun.lock` accordingly

Out of scope: verified-live deps in finding D24 (fontsource x4 in
`app.css`, `@rokkit/unocss`, `@vitest/browser` in app, etc.).

## Evidence

- D4 root `dompurify` — only users blocks+ui declare their own; root has
  no src. Verify: `rg -ln dompurify config/ packages/*/src`
- D5 learn `@fontsource/open-sans,@fontsource/overpass` — zero refs
  (re-verified). Verify: `rg -n 'open-sans|overpass' apps/learn/src
  apps/learn/*.js apps/learn/*.css`
- D6 learn `@mlc-ai/web-llm` — never imported; `llm.svelte.ts:127` loads
  pinned CDN build via `@vite-ignore` dynamic import (re-verified zero
  static imports). Verify: `rg -n "from ['\"]@mlc|require\(.*web-llm"
  apps/learn/src`
- D7 learn `@iconify-json/mdi` — only `guides/toolchain/content.md:121`
  docs snippet. Verify: `rg -ln 'iconify-json/mdi' apps/learn/src
  apps/learn/*.js apps/learn/spec apps/learn/e2e`
- D8 app `playwright,@testing-library/jest-dom,@testing-library/user-event`
  — zero refs. Verify: `rg -ln 'playwright|jest-dom|user-event'
  packages/app/src packages/app/spec packages/app/browser`
- D9 learn `@vitest/browser` — redundant with root; learn has no
  `browser/` dir. Verify: `ls -d apps/learn/browser;
  ls -d packages/*/browser`
- Owners: repo root, `apps/learn`, `packages/app` maintainers

## Impact

- Leaner manifests and lockfile; no code change

## Risks

- **Docs-snippet execution (D7)**: the toolchain guide snippet is
  consumer-facing documentation, not executed code; dropping the devDep
  does not break the snippet as prose. Re-run each verify grep plus the
  full suite and frozen install before merge.
