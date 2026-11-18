# Tasks: extract-shell-demo-init

- [ ] 1. Add `initShellDemo(id[, variant])` to
  `#lib/koan/shell.svelte.ts` covering the plain and `$effect` variants
  with identical semantics, plus a unit spec for both
- [ ] 2. Repoint the 43 plain-variant `routes/app/*/+page.svelte` pages
- [ ] 3. Repoint the 14 `$effect`-variant pages, preserving exact behaviour
- [ ] 4. Verify with `rg` that no inline shell `onMount` boilerplate
  remains under `apps/learn/src/routes/app/`
- [ ] 5. Run the learn test suite and a production build green
