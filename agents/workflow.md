# Agent Workflow

Rules and methodology for AI agents working on this repository.
CLAUDE.md loads this file at session start — follow it.

---

## Core Principles

1. **Understand "why" before "how"** — confirm reasoning before coding. If direction seems wrong, say so.
2. **Ask, don't assume** — if instructions are vague, ask one question at a time.
3. **Design before implementation** — for non-trivial work, agree on approach before writing code.
4. **Document as you go** — decisions decay if not captured immediately.
5. **One piece at a time** — small reviewable increments. Commit after each coherent unit.

---

## Task Classification

### Design Work (full pipeline)

- New features, new patterns, architectural changes
- Anything that could be done multiple ways
- **Process:** Backlog → Propose → Implement → Archive (see below)

### Tactical Work (lightweight)

- Bug fixes, small changes, clear scope
- **Process:** Confirm reasoning → implement → update docs if needed

### When in Doubt

Ask. The cost of a question is low.

---

## Pipeline: Backlog → Propose → Implement → Archive (openspec)

All non-trivial work follows the openspec process. Context: `openspec/project.md`.

### 1. BACKLOG

Identify or create a work item in `openspec/backlog/` as `BL-NNN-<slug>.md`
(registry + format: `openspec/backlog/README.md`). Pre-openspec items keep
their `docs/backlog/` home and are aliased by BL-ID in that registry.

- If the work touches a **new module**: create the feature vision
  (`docs/features/NN-<module>.md`) and design (`docs/design/NN-<module>.md`) first.
- If the work touches an **existing module**: check that the feature and design
  docs are still current.
- Clarifications happen inline in conversation — capture answers in the relevant docs.

### 2. PROPOSE

Create a change in `openspec/changes/<name>/` with three files:

- `proposal.md` — why, what, impact, risks (cite the BL item + product/spec homes)
- `tasks.md` — ordered checkbox task list, one commit per task where practical
- `specs/spec.md` — Given/When/Then scenarios the implementation must satisfy

- **Present the proposal to the user for agreement.** No code until agreed.
- One active change per stream.

### 3. IMPLEMENT

Execute the agreed proposal.

- Work through `tasks.md` in order.
- Before marking work done, run the **completion checklist**:
  1. Code complete, tests pass (`bun run test:ci`), lint clean (0/0)
  2. Feature doc still accurate? Update if not.
  3. Design doc still accurate? Update if not.
  4. Move the change dir to `openspec/changes/archive/<name>/`
  5. Update `openspec/changes/archive/README.md` index + `agents/journal.md`
  6. Close the BL item (mark done in its home)

---

## Interrupts

Everything goes to `openspec/backlog/` as a new `BL-NNN-<slug>.md`. No inline
insertion into current work. Pick it up next.

---

## Session Lifecycle

### Session Start

1. Read `agents/workflow.md` — this file
2. Read `agents/memory.md` — project knowledge
3. Read `agents/journal.md` (last ~50 lines) — recent progress
4. Check `openspec/changes/` — active change to resume?
5. Consult `agents/design-patterns.md` and `agents/references.md` as needed during implementation

### During Session

- Track progress in the active change's `tasks.md`
- Capture decisions in `agents/memory.md` immediately
- Update `docs/design/*.md` when designs change

### Before Commit

1. Run tests — all must pass
2. Run lint — 0 errors AND 0 warnings (`--max-warnings 0` enforces it)
3. Update `agents/journal.md`

---

## Crash Recovery

1. Check `openspec/changes/` — find active change (dirs other than `archive/`)
2. Read `agents/journal.md` — last recorded progress
3. Resume from where work stopped

---

## File Reference

| File                        | Purpose                        | When to update                 |
| --------------------------- | ------------------------------ | ------------------------------ |
| `agents/workflow.md`        | This file — methodology        | When workflow evolves          |
| `agents/memory.md`          | Project knowledge, principles  | When decisions are made        |
| `agents/journal.md`         | Progress log                   | Every session                  |
| `agents/design-patterns.md` | Established patterns cookbook  | When patterns are proven       |
| `agents/references.md`      | Coding conventions, styling    | When conventions change        |
| `openspec/project.md`       | Project context for changes    | When stack/conventions change  |
| `openspec/backlog/`         | BL-ID backlog items            | When items are added/completed |
| `openspec/changes/<name>/`  | Active change proposal         | When starting/finishing work   |
| `docs/features/`            | Product vision (what/why)      | When module scope changes      |
| `docs/design/`              | Module design (how/why)        | When design changes            |
