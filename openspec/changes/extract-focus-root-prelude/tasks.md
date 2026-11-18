# Tasks: extract-focus-root-prelude

- [ ] 1. Line-diff the 3 preludes (`structure.ts:409-417`,
  `sunburst.ts:129-137`, `world.ts:142-151`) and record any divergence
- [ ] 2. Add `resolveFocusRoot(model, options, name)` to a layout-shared
  module with unit specs (warning, missing-node, resolved-root)
- [ ] 3. Repoint all 3 call sites
- [ ] 4. Run the graph test suite green
