# Archive of pre-openspec plans & specs

Migrated 2026-11-18 from the retired `docs/plans/` and `docs/superpowers/`
directories (see `git log --follow` on any file for its full history). Files
are byte-identical to the originals — **do not edit**; when a design changes,
update the durable home in `docs/design/` instead.

## Path mapping

| Before (retired)          | After (this archive)                         |
| ------------------------- | -------------------------------------------- |
| `docs/plans/*`            | `openspec/changes/archive/docs-plans/*`      |
| `docs/superpowers/plans/*`| `openspec/changes/archive/superpowers-plans/*`|
| `docs/superpowers/specs/*`| `openspec/changes/archive/superpowers-specs/*`|

## Reading notes

- **Internal cross-references use pre-migration paths.** A plan citing
  `docs/superpowers/specs/…` means the file of that name in
  `superpowers-specs/` below. The mapping above resolves every one.
- **`agents/journal.md` and `docs/CHECKPOINT.md` still cite the old paths.**
  Both are frozen historical records and intentionally not rewritten.
- **Status key:** *shipped* = built as planned; *superseded* = closed without
  building (owner decision or later work made it moot); *partial* = built in
  part, remainder tracked elsewhere. Evidence points at the journal entry,
  priority-checklist row, or implementation that proves it.
- Every migrated item was completed or superseded — **no active/live plan
  existed at migration time**, so no `openspec/changes/<name>/` was created
  from this set. New work starts in `openspec/backlog/` / `openspec/changes/`.

## `docs-plans/` (27 files)

| File | Status | Evidence / durable home |
| ---- | ------ | ----------------------- |
| `README.md` (Active Plan slot: token system + demo + zen-sumi) | stale slot, content shipped — retired | Phases 3–9 + zen-sumi shipped 2026-04-28…05-11 (`docs/design/12-priority.md`); the "active plan" slot is replaced by `openspec/changes/` |
| `2026-03-06-website-redesign.md` + `-design.md` | shipped | journal: "Website Redesign COMPLETE" |
| `2026-03-07-nav-restructure-content.md` + `-design.md` | shipped | journal: "Nav Restructure & Playground Alignment COMPLETE" |
| `2026-06-01-guides-section.md` | shipped 2026-06-01 | `docs/design/12-priority.md`; home: `docs/design/05-website.md` |
| `2026-08-13-chart-grid-highlight-trend.md` | shipped 2026-08-13 | `docs/design/12-priority.md`; home: `docs/design/20-chart.md` |
| `2026-08-13-chart-interactive-selection.md` | shipped 2026-08-13 | `docs/design/12-priority.md`; home: `docs/design/20-chart.md` |
| `2026-08-21-state-pattern-migration.md` | superseded 2026-10-01 | owner decision recorded in the file; gates kept; home: `docs/design/18-state-patterns.md` |
| `2026-08-21-typography-scale.md` | done 2026-10-01 by a different route | recorded in the file; phases kept as history |
| `2026-09-27-graph-package-extraction.md` | slice 1 built 2026-09-28 | `docs/design/12-priority.md`; acceptance tracked as BL-012; home: `docs/design/23-graph.md` |
| `2026-09-30-architecture-analysis-primitives.md` | done 2026-09-30 | journal 2026-09-30; homes: `20-chart.md`, `23-graph.md` |
| `2026-09-30-formbuilder-decomposition.md` | done 2026-09-30 | journal 2026-09-30 (4); home: `docs/design/03-forms.md` |
| `2026-09-30-graph-drill-events.md` (#165) | done 2026-09-30 | journal 2026-09-30 (12); home: `23-graph.md` |
| `2026-09-30-graph-dual-arc-diagram.md` (#169) | done 2026-09-30 | journal 2026-09-30 (16); home: `23-graph.md` |
| `2026-09-30-graph-layers-layout.md` (#167) | done 2026-09-30 | journal 2026-09-30 (14); home: `23-graph.md` |
| `2026-09-30-graph-polymetric-tree.md` (#168) | done 2026-09-30 | journal 2026-09-30 (15); home: `23-graph.md` |
| `2026-09-30-graphstate-decomposition.md` | done 2026-09-30 | journal 2026-09-30 (11); home: `23-graph.md` |
| `2026-09-30-navigator-decomposition.md` | done 2026-09-30 | journal 2026-09-30 (7); home: `docs/design/04-actions.md` |
| `2026-09-30-plot-svelte-decomposition.md` | done 2026-09-30 | journal 2026-09-30 (9); home: `20-chart.md` |
| `2026-09-30-plotstate-decomposition.md` | done 2026-09-30 | journal 2026-09-30 (3); home: `20-chart.md` |
| `2026-09-30-select-decomposition.md` | done 2026-09-30 | journal 2026-09-30 (11); home: `docs/design/02-components.md` |
| `2026-09-30-unocss-preset-decomposition.md` | done 2026-09-30 | journal 2026-09-30 (10); home: `docs/design/09-theming.md` |
| `2026-10-01-graph-messages-and-interactions.md` | done 2026-10-01 | journal 2026-10-01 (1); home: `23-graph.md` |
| `2026-10-01-graph-shade-channel.md` (#164) | done 2026-10-01 | journal 2026-10-01 (3); home: `docs/design/24-world-view.md` |
| `2026-10-01-list-multiselect.md` | done 2026-10-01 | journal 2026-10-01 (5); home: `02-components.md` |
| `2026-10-02-chat-intents.md` | done 2026-10-02 | journal 2026-10-02; architecture carried into `docs/design/26-chat-intents.md` |

## `superpowers-plans/` (41 files)

| File | Status | Evidence / durable home |
| ---- | ------ | ----------------------- |
| `2026-03-12-auth-icons-expansion.md` | shipped | `packages/icons/src/auth/`; home: `docs/design/70-tools.md` |
| `2026-03-12-conditional-fields.md` | shipped | `docs/design/12-priority.md` Archive; home: `03-forms.md` |
| `2026-03-12-repo-restructure.md` | shipped | repo + `apps/` restructure (journal 2026-05-28) |
| `2026-03-16-learn-site-sync.md` | shipped | `sync:assets` in `apps/learn/package.json`; home: `05-website.md` |
| `2026-03-16-llms-entry-point-and-cli.md` | shipped | `docs/llms/`; home: `05-website.md` |
| `2026-03-16-llms-infrastructure.md` | shipped | `docs/llms/`; home: `05-website.md` |
| `2026-03-16-llms-learn-site-gap-analysis.md` | tracker — items done | file's own ✅ ledger; remainder superseded by later site work |
| `2026-03-16-llms-package-docs.md` | shipped | `docs/llms/packages/`; home: `05-website.md` |
| `2026-03-16-table-of-contents.md` | shipped | `@rokkit/app` `TableOfContents`, used by guides layout |
| `2026-03-17-glyph-icon-collection.md` | shipped | `packages/icons/src/glyph/`; home: `70-tools.md` |
| `2026-03-20-theme-system-expansion.md` | partial / superseded | palettes + config shipped; extra styles (`shadcn`, …) aspirational per `docs/design/10-themes.md`; token-system overhaul superseded the rest |
| `2026-03-22-chart-system.md` | shipped | journal 2026-03-26 "Chart System Completion"; home: `20-chart.md` |
| `2026-03-23-chart-new-types.md` | shipped | `12-priority.md` Archive (P3); home: `20-chart.md` |
| `2026-03-23-chart-stat-brewers.md` | shipped | chart stat system; home: `20-chart.md` |
| `2026-03-23-ggplot-aesthetic-mapping.md` | shipped | `12-priority.md` Archive (P3); home: `20-chart.md` |
| `2026-03-23-plot-crossfilter.md` | shipped | CrossFilter in `@rokkit/chart`; home: `20-chart.md` |
| `2026-03-23-plot-facets-animation.md` | shipped | FacetPlot/AnimatedPlot; home: `20-chart.md` |
| `2026-03-23-plot-foundation.md` | shipped | PlotState lineage; home: `20-chart.md` |
| `2026-03-23-plot-rendering.md` | shipped | geom renderers; home: `20-chart.md` |
| `2026-03-26-analysis-rokkit.md` | shipped | MarkdownRenderer, `@rokkit/blocks`, Sparkline all exist |
| `2026-04-27-playwright-visual-baseline.md` | shipped (Phase 3) | `12-priority.md`; home: `docs/design/06-testing.md` |
| `2026-04-29-phase4-design-tokens.md` | shipped (Phase 4) | `12-priority.md`; home: `09-theming.md` |
| `2026-05-11-colorspace-adapter.md` | shipped 2026-05-11 | `12-priority.md`; home: `09-theming.md` |
| `2026-05-12-semantic-ink-extensible-roles.md` | shipped 2026-05-12 | `12-priority.md`; home: `09-theming.md` |
| `2026-05-14-koan-demo-shell.md` | shipped | Koan shell at `/app` (`12-priority.md`); home: `05-website.md` |
| `2026-05-15-trimmed-token-vocabulary.md` | shipped (rel. 1 + 1.x) | `12-priority.md`; home: `09-theming.md` |
| `2026-05-21-direct-token-mapping-refactor.md` | shipped | `docs/backlog/done/2026-05-20-named-tokens-no-dark-flip.md`; home: `09-theming.md` |
| `2026-06-05-cli-named-token-config-and-doctor.md` | shipped 2026-06-06 | `12-priority.md`; home: `70-tools.md` |
| `2026-06-09-rokkit-skills-add.md` | shipped 2026-06-09 | `12-priority.md`; home: `70-tools.md` |
| `2026-06-10-command-system.md` | shipped 2026-06-10 | journal 2026-06-10; home: `docs/design/19-command-system.md` |
| `2026-06-10-skin-system.md` | shipped 2026-06-10 | journal 2026-06-10 (phases 2–3 followed); home: `docs/design/17-skin-system.md` |
| `2026-06-23-drop-legacy-z-scale.md` | shipped 2026-06-24 | `12-priority.md`; home: `09-theming.md` |
| `2026-06-23-lock-mode.md` | shipped 2026-06-23 | `12-priority.md`; home: `02-components.md` |
| `2026-06-29-chat-components.md` | shipped (Phase 1) 2026-06-29 | journal 2026-06-29/30; home: `02-components.md` |
| `2026-06-30-ask-rokkit-ai-demo.md` | shipped 2026-07-01 | journal 2026-07-01; evolved into `26-chat-intents.md` (2026-10-02) |
| `2026-06-30-components-catalog-consolidation.md` | shipped 2026-06-30 | journal 2026-06-30; home: `docs/design/11-inventory.md` |
| `2026-08-14-distribution-geoms.md` | shipped 2026-08-14 (#143/#144) | journal 2026-08-14; home: `20-chart.md` |
| `2026-08-18-enriched-sparkline.md` | shipped 2026-08-18 | `12-priority.md`; home: `20-chart.md` |
| `2026-08-19-sparkline-demo-guide-gallery-e2e.md` | shipped 2026-08-19 (#147) | `12-priority.md`; homes: `05-website.md`, `06-testing.md` |
| `2026-08-20-spark-plot-geom-composition.md` | shipped 2026-08-20 (cycle 1) | `12-priority.md`; home: `20-chart.md` |
| `2026-08-21-radar-geom.md` | shipped 2026-08-21 (cycle 2) | `12-priority.md`; home: `20-chart.md` |

## `superpowers-specs/` (31 files)

Design specs. Each shipped alongside its plan (or, where marked, stands alone);
durable knowledge lives in the listed `docs/design/` home.

| File | Durable home |
| ---- | ------------ |
| `2026-03-12-auth-icons-expansion-design.md` | `docs/design/70-tools.md` (icon sets) |
| `2026-03-12-conditional-fields-design.md` | `docs/design/03-forms.md` |
| `2026-03-12-repo-restructure-design.md` | archive-only (one-shot; the repo is the evidence) |
| `2026-03-16-learn-site-sync-design.md` | `docs/design/05-website.md` |
| `2026-03-16-llms-content-expansion-design.md` | `docs/design/05-website.md` (+ `docs/llms/` itself) |
| `2026-03-16-llms-infrastructure-design.md` | `docs/design/05-website.md` |
| `2026-03-16-llms-txt-theming-docs.md` | superseded by content-expansion (noted in that spec); home: `05-website.md` |
| `2026-03-17-glyph-icon-collection.md` | `docs/design/70-tools.md` |
| `2026-03-20-theme-system-design.md` | `docs/design/09-theming.md`, `docs/design/10-themes.md` |
| `2026-03-22-chart-system-design.md` | `docs/design/20-chart.md` |
| `2026-03-23-plot-architecture-design.md` | `docs/design/20-chart.md` |
| `2026-03-25-table-mvc-design.md` | `docs/design/components/data-table.md` (no paired plan; stands alone) |
| `2026-04-29-zen-sumi-theme-design.md` | `docs/design/10-themes.md` |
| `2026-05-11-colorspace-adapter-design.md` | `docs/design/09-theming.md` |
| `2026-05-12-semantic-ink-and-extensible-roles-design.md` | `docs/design/09-theming.md` |
| `2026-05-12-settings-skin-customizer-design.md` | `docs/design/05-website.md` (settings panel); item in `docs/backlog/done/` |
| `2026-05-14-koan-demo-shell-design.md` | `docs/design/05-website.md` |
| `2026-05-15-trimmed-token-vocabulary-design.md` | `docs/design/09-theming.md` |
| `2026-05-21-direct-token-mapping-design.md` | `docs/design/09-theming.md` |
| `2026-06-05-cli-named-token-config-and-doctor-design.md` | `docs/design/70-tools.md` |
| `2026-06-23-drop-legacy-z-scale-design.md` | `docs/design/09-theming.md` |
| `2026-06-23-lock-mode-design.md` | `docs/design/02-components.md` |
| `2026-06-24-chat-components-design.md` | `docs/design/02-components.md` (+ `docs/design/components/message.md`) |
| `2026-06-30-ask-rokkit-ai-demo-design.md` | `docs/design/26-chat-intents.md` (as evolved 2026-10-02) |
| `2026-06-30-components-catalog-consolidation-design.md` | `docs/design/11-inventory.md` |
| `2026-08-14-distribution-geoms-design.md` | `docs/design/20-chart.md` |
| `2026-08-15-geom-orientation-flip-design.md` | `docs/design/20-chart.md` (no paired plan; orientation support shipped) |
| `2026-08-18-enriched-sparkline-design.md` | `docs/design/20-chart.md` |
| `2026-08-18-sparkline-demo-verification-design.md` | `docs/design/06-testing.md` (verification approach) |
| `2026-08-20-radar-geom-design.md` | `docs/design/20-chart.md` |
| `2026-08-20-spark-plot-geom-architecture-design.md` | `docs/design/20-chart.md` |
