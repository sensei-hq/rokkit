# remove-dead-learn-types-and-components

Delete the unimported Observatory types module and the 9 orphaned learn
components.

Scan findings: dead-D11, dead-D12 (dead-code scan, safe removals).
Severity: Low (hygiene — verified zero-reference deletions).

## Why

`apps/learn/src/lib/types.ts` carries 12 `Observatory` interfaces with
zero importers (the live koan types live in `koan/types.ts`), and 9
components under `apps/learn/src/lib/` have zero references in src, spec,
e2e, or routes (`catalog.ts` uses static imports, no globs, so tracing is
sound). Dead UI and dead types mislead every new reader.

## What

- Delete `apps/learn/src/lib/types.ts` if it contains only the 12 dead
  interfaces; otherwise delete just those interfaces
- Delete the 9 orphan components: `koan/components/BrandMark.svelte`,
  `ChatPanel.svelte`, `ConversationList.svelte`, `Welcome.svelte`,
  `Canvas.svelte`, `ShowcaseCanvas.svelte`, `Gallery.svelte`,
  `PreviewCard.svelte`, `lib/components/ThemeControls.svelte`
- Run the learn build to confirm nothing referenced them

Out of scope: test-only modules needing a maintainer call (finding D13).

## Evidence

- D11 `apps/learn/src/lib/types.ts::FtrData,Koan,Insight,Session,
  ObservatoryData,RetroSection,SessionsData,WizardStep,Project,SetupData,
  NavItem,NavGroup` — zero importers (re-verified: `ObservatoryData`
  present in file, zero `#lib/types` importers). Verify: `rg -ln
  'FtrData|ObservatoryData|#lib/types' apps/learn/src apps/learn/spec`
- D12 orphan components listed above — zero refs (re-verified sample:
  zero `BrandMark` content refs; files exist). Verify: `rg -ln
  'BrandMark|ChatPanel|ConversationList|ThemeControls|ShowcaseCanvas|
  PreviewCard|components/Canvas|components/Gallery|components/Welcome'
  apps/learn/src apps/learn/spec apps/learn/e2e`
- Owner: `apps/learn` maintainer

## Impact

- 10 fewer dead files; no live-code change

## Risks

- **Dynamic reference**: a string-built import path could escape `rg`;
  mitigate with the learn production build plus full suite as the
  acceptance gate (a missed reference fails loudly there).
