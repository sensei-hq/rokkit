# Rokkit — OpenSpec project context

**Rokkit** is a Svelte 5 component library and design system for data-driven
applications, organized as a Bun monorepo. Every change proposed under
`openspec/changes/` must respect the conventions below.

## Stack

- **Runtime:** Bun (pinned — root `packageManager` + every `setup-bun`
  `bun-version`; see `config/spec/check-pins.spec.js`)
- **Language:** JavaScript/TypeScript, Svelte 5 runes mode
- **Styling:** UnoCSS (`@rokkit/unocss` preset) + theme CSS (`@rokkit/themes`)
- **Tests:** Vitest (`bun run test:ci`), Playwright e2e in `apps/learn`
- **Lint:** `bun run lint` — **0 errors AND 0 warnings** (`--max-warnings 0`)

## Repo layout

```text
openspec/
  project.md            <-- you are here (project context for changes)
  product/README.md     <-- product/vision homes (canonical: docs/features/)
  specs/README.md       <-- durable spec homes (canonical: docs/design/)
  backlog/README.md     <-- BL-ID registry + intake for new backlog items
  changes/<name>/       <-- one active change: proposal.md, tasks.md, specs/spec.md
  changes/archive/      <-- completed pre-openspec plans/specs (historical)
packages/               <-- @rokkit/* library packages
apps/learn/             <-- docs site + Koan demos + e2e tests (deployed)
docs/
  features/             <-- product vision (Gherkin scenarios)
  design/               <-- module design docs (NN-xxx.md, durable)
  backlog/              <-- pre-openspec backlog items (kept; see backlog/README.md)
  llms/                 <-- AI-readable references (synced to the learn site)
agents/                 <-- AI operational files (workflow, memory, journal)
```

## Immutable principles

Checked during the PROPOSE phase. Violations must be justified or the change
revised. (Canonical: `agents/memory.md`.)

1. **Data-First** — Components adapt to data structures via field mapping.
2. **Composable** — Every component extensible via snippets without modification.
3. **Consistent API** — Standard props: `items`, `value` (bindable), `fields`,
   `onchange`/`onselect`.
4. **Accessible** — Keyboard navigation + ARIA via controller + navigator pattern.
5. **Themeable** — Unstyled components with data-attribute hooks; theme/layout
   CSS separation.

## Change process (summary)

Full process: `agents/workflow.md`.

1. **Backlog** — open item in `openspec/backlog/` (`BL-NNN-<slug>.md`) or pick
   up an existing one (registry in `openspec/backlog/README.md`).
2. **Propose** — `openspec/changes/<name>/{proposal.md,tasks.md,specs/spec.md}`;
   present for agreement. No code until agreed. One active change per stream.
3. **Implement** — work tasks in order; keep `docs/design/` + `docs/features/`
   accurate; run tests + lint (both must pass).
4. **Archive** — move the change dir under `openspec/changes/archive/`,
   update the archive index, log in `agents/journal.md`, close the BL item.

## Gates for every change

- `bun run lint` — 0 errors, 0 warnings
- `bun run test:ci` — full suite green (or the scoped suite the change touches,
  plus a full run before merge)
- `docs/design/*.md` still accurate for touched modules
- No new `--max-warnings` suppressions without a dated justification
