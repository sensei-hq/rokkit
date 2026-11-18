# Tasks: fix-misplaced-user-event-dep

- [ ] 1. Grep the whole repo for `user-event` imports to confirm forms
  specs are the only consumer
- [ ] 2. Add `@testing-library/user-event` (same version) to
  `packages/forms` devDependencies and remove it from root devDependencies
- [ ] 3. Regenerate `bun.lock` and diff the resolved entry (must be
  version-identical)
- [ ] 4. Run `bun install --frozen-lockfile` and the forms suite green
