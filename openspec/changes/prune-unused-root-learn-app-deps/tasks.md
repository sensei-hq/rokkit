# Tasks: prune-unused-root-learn-app-deps

- [ ] 1. Re-run the D4-D9 verify greps/commands to confirm zero references
- [ ] 2. Drop the unused entries from the root, learn, and app manifests
  (keeping app's `@vitest/browser`)
- [ ] 3. Regenerate `bun.lock`
- [ ] 4. Run `bun install --frozen-lockfile`, the learn build, lint, and
  the full test suite green
