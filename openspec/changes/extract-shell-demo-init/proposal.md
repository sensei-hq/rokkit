# extract-shell-demo-init

Extract the copy-pasted `onMount` shell boilerplate in every
`apps/learn` demo page into one `initShellDemo(id[, variant])` helper.

Scan finding: dup-DC1 (duplication scan, >=3-use candidate).
Severity: Low (maintainability — ~60-site boilerplate clone).

## Why

Every demo page under `apps/learn/src/routes/app/*/+page.svelte` repeats the
same shell-initialisation block: 43x a plain 9-line `onMount` variant and 14x
a 13-line `$effect` variant (60 files contain the pattern; verified
`button/+page.svelte:1-9`). Any change to demo initialisation must be edited
in dozens of places and will inevitably drift.

## What

- Add `initShellDemo(id[, variant])` to `#lib/koan/shell.svelte.ts`, covering
  both the plain and the `$effect` variants with identical semantics
- Repoint all `apps/learn/src/routes/app/*/+page.svelte` pages at the helper
- Leave `states/spec/setup.js` and other non-shell setup files alone

Out of scope: any other demo-initialisation pattern outside `routes/app`.

## Evidence

- `apps/learn/src/routes/app/*/+page.svelte::onMount` — 43x plain 9-line
  variant (e.g. `button/+page.svelte:1-9`, `card/+page.svelte:1-9`) + 14x
  `$effect` 13-line variant (e.g. `table/+page.svelte:1-13`,
  `graph/+page.svelte:3`)
- Owner: `apps/learn/src/lib/koan/shell.svelte.ts`

## Impact

- One new exported helper; ~60 demo pages shrink to a one-line call
- No behavioural change: same `shell.lastQuery` default and
  `setShellResponse(id)` ordering per variant

## Risks

- **Variant drift**: the `$effect` variant must keep exact semantics;
  mitigate with a unit spec covering both variants before repointing.
- **Import churn**: mechanical edits across many files; mitigate by
  verifying with `rg` that no inline boilerplate remains and running the
  learn build plus tests.
