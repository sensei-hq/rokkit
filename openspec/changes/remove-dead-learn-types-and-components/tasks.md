# Tasks: remove-dead-learn-types-and-components

- [ ] 1. Re-run the D11/D12 verify greps to confirm zero references
- [ ] 2. Delete `apps/learn/src/lib/types.ts` (or just the 12 dead
  interfaces if the file holds live exports)
- [ ] 3. Delete the 9 orphan components
- [ ] 4. Run the learn production build and the full test suite green
