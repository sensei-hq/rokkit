# Backlog (BL-IDs)

Backlog items carry stable `BL-NNN` IDs. New items are created directly in this
directory as `BL-NNN-<slug>.md`. Next ID: **BL-013**.

## New-item format

```markdown
# BL-NNN: <Title>

**Status:** open | blocked:<reason> | done:<date>
**Area:** <component | chart | graph | themes | toolchain | learn-site | ...>
**Design:** <docs/design/NN-*.md, when agreed>

## Problem

Why this matters, in one or two sentences.

## Acceptance

- [ ] Observable outcome 1
- [ ] Observable outcome 2
```

## Pre-openspec registry

Items below predate openspec and keep their `docs/backlog/` home (that
directory was out of the migration's scope; moving them would fork live
content). The BL-ID is their openspec alias — cite it in changes and journal
entries. When one is picked up, the change proposal references the BL-ID and
the `docs/backlog/` file together; when it ships, mark it done in
`docs/backlog/` per the old convention and note the BL-ID as closed here.

| ID     | Item                                                | Home                                                        | Status at migration (2026-11-18)              |
| ------ | --------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------- |
| BL-001 | Actions/controllers simplification investigation    | `docs/backlog/2026-05-20-actions-controllers-simplification-investigation.md` | open — investigation only, do not implement yet |
| BL-002 | Koan demo AI-chat-first redesign                    | `docs/backlog/2026-05-20-koan-demo-ai-chat-first-redesign.md` | open — mockup phase                           |
| BL-003 | Select scroll follow-ups                            | `docs/backlog/2026-06-09-select-scroll-followups.md`        | open — small follow-up                        |
| BL-004 | md-toggle outer-height parity                       | `docs/backlog/2026-06-16-md-toggle-outer-height-parity.md`  | open — deferred design refinement             |
| BL-005 | Themes chart-css plot selectors                     | `docs/backlog/2026-08-13-themes-chart-css-plot-selectors.md` | open — pre-existing theming gap               |
| BL-006 | Chart geom gaps                                     | `docs/backlog/2026-08-16-chart-geom-gaps.md`                | open — missing-geom tracker                   |
| BL-007 | Chart aesthetics unification                        | `docs/backlog/2026-08-17-chart-aesthetics-unification.md`   | open — design approved, ready for plan        |
| BL-008 | Chart explorer demo                                 | `docs/backlog/2026-08-17-chart-explorer-demo.md`            | open — design approved, ready to build        |
| BL-009 | Brand colour as foreground                          | `docs/backlog/2026-08-31-brand-colour-as-foreground.md`     | open — needs a design decision first          |
| BL-010 | Coverage rebaseline (vitest 4)                      | `docs/backlog/2026-09-12-coverage-rebaseline-vitest4.md`    | open — mechanical ratchet work                |
| BL-011 | TypeScript 7 migration                              | `docs/backlog/2026-09-12-typescript-7-migration.md`         | open — blocked: waiting on upstream           |
| BL-012 | Graph package extraction acceptance (dbd consumes)  | `docs/backlog/2026-09-27-graph-package-extraction.md`       | open — slice 1 built, blocked on dbd          |

## Stale-status candidates (verify-and-close, not BL items)

Found during migration; each reads as done but its file still sits in
`docs/backlog/` with a non-done status. Confirm, then move to `docs/backlog/done/`:

- `2026-05-20-global-shortcut-handler.md` — says "implementation pending", but
  the command system shipped 2026-06-10 (journal; `docs/design/19-command-system.md`).
- `2026-05-23-interactive-koan-mode.md` — says "built for /chat on 2026-10-02";
  close out if the Koan `/app` surface needs nothing more.
- `2026-08-14-demo-app-complexity-refactors.md` — self-reports DONE, never moved
  to `done/`.
- Eight `2026-09-*` files self-report CLOSED but still sit in the root
  (`residual-advisories`, `flaky-components-catalog-e2e`, `learn-app-untypechecked`,
  `stale-props-types`, `table-column-snippet-dead`, `untyped-snippet-props`,
  `svelte-peer-range`, `svelte-as-hard-dependency`).

## Lifecycle

```text
BL-NNN (open) → openspec/changes/<name>/ (proposed → implementing) → openspec/changes/archive/ (shipped)
```
