# Tasks: dedupe-icons-lib-index

- [ ] 1. Determine generated-vs-hand-written: check external iconify
  tooling, git history, and any template for `packages/icons/lib/*/index.js`
- [ ] 2a. If hand-written: extract one shared module and repoint all 8
  entries as re-exports
- [ ] 2b. If generated: fix/add the generator or template so the 8 files
  are produced, not maintained
- [ ] 3. Verify all 8 entry paths still resolve and the icons package
  tests pass
