# Rokkit — Agent Instructions

This file is the entry point for any AI agent working on this repo.

## MANDATORY: Load Workflow First

Before doing any work, read these files in order:

1. **`agents/workflow.md`** — methodology and pipeline
2. **`agents/memory.md`** — project knowledge, principles, tooling
3. **`agents/journal.md`** (last ~50 lines) — recent progress
4. **`docs/design/12-priority.md`** — check priority checklist

These files govern how you work. Do not skip them.

---

## Project Overview

**Rokkit** is a Svelte 5 component library and design system for data-driven applications. It features field mapping, snippet-based customization, keyboard navigation, and a theme/layout CSS separation architecture.

## Repository Structure

```text
rokkit/
  CLAUDE.md                      <-- You are here
  agents/                        <-- AI operational files
    workflow.md                  <-- Methodology and pipeline (READ FIRST)
    memory.md                   <-- Project knowledge, principles, tooling
    journal.md                  <-- Chronological progress log
    design-patterns.md          <-- Established patterns cookbook
    references.md               <-- Coding conventions, styling, project structure
  openspec/                      <-- Change process: backlog/, changes/, specs/, product/
  docs/
    features/                   <-- Feature specs (Gherkin scenarios, vision)
    design/                     <-- Architecture and design docs (numbered: NN-xxx.md)
  packages/                     <-- Library packages (@rokkit/ui, states, actions, etc.)
  apps/
    learn/                      <-- Koan showcase + framework guides + per-component demos (deployed)
```

## Key Design Principles

- **Data-First** — Components adapt to data structures via field mapping, not the other way around
- **Composable** — Every component extensible via snippets without modification
- **Consistent API** — Standard props: `items`, `value` (bindable), `fields`, `onchange`/`onselect`
- **Accessible** — Keyboard navigation + ARIA via controller + navigator pattern
- **Themeable** — Unstyled components with data-attribute hooks, theme/layout CSS separation

## Working with this Repo

### Commands (run from repo root)

```bash
# Tests
bun run test:ci                   # All tests (~2536)
bun run test:ui                   # UI package tests

# Lint
bun run lint                      # 0 errors expected

# E2E tests
cd apps/learn && npx playwright test
```

## Conventions

### Pipeline for work items

For non-trivial work: **Backlog → Propose → Implement → Archive** (openspec).
See `agents/workflow.md` for the full process and `openspec/project.md` for
change context. New backlog items are `openspec/backlog/BL-NNN-<slug>.md`;
active work lives in `openspec/changes/<name>/{proposal.md,tasks.md,specs/spec.md}`.

### When a feature design is agreed upon

1. Update the relevant `docs/design/*.md` module file
2. Log in `agents/journal.md`
3. Create/update the change proposal in `openspec/changes/<name>/`

### When completing work

1. Run tests and lint — both must pass
2. Check design docs are still accurate
3. Move the change to `openspec/changes/archive/` and update its index
4. Update `agents/journal.md` with summary and commit hashes
5. Update status in `docs/features/` and `docs/design/`, close the BL item

### Lint Rules

**Zero errors and zero warnings. Both.** `bun run lint` runs with
`--max-warnings 0`, so a single warning fails the build — there is no tolerated
backlog to hide a new one in. If lint prints anything, this change caused it.

- Do not silence a warning you can fix. Decompose the function, or table-drive
  the branch it is complaining about.
- Reach for `eslint-disable` only when the rule is genuinely wrong for the case,
  and state why on the line above. `PlotState.#sortedBandDomain` is the shape of
  an acceptable one: a function-local keyed accumulator that `SvelteMap` would
  make measurably worse.
- `bun run lint` runs with `--fix`, which silently DELETES an unused disable
  directive. A misplaced one leaves a blank line and no warning, so check that a
  disable you added is still there.

## Key Files Quick Reference

| File                        | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `agents/workflow.md`        | Methodology, pipeline, session lifecycle  |
| `agents/memory.md`          | Project knowledge, principles, tooling    |
| `agents/journal.md`         | Chronological progress log                |
| `agents/design-patterns.md` | Established patterns cookbook             |
| `agents/references.md`      | Coding conventions, styling, structure    |
| `openspec/project.md`       | Project context for changes               |
| `openspec/backlog/`         | BL-ID backlog + registry                  |
| `openspec/changes/`         | Active change proposals                   |
| `agents/tracking.md`        | Active tracking log                       |
| `docs/features/`            | Feature specs (Gherkin scenarios, vision) |
| `docs/design/`              | Architecture and design docs              |
