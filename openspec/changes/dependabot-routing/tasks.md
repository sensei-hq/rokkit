# Tasks: dependabot-routing

- [ ] 1. Add `.github/dependabot.yml` for the bun/npm ecosystem with
  `target-branch: develop`, a weekly schedule, and grouped minor/patch
  updates
- [ ] 2. Verify the `Check` workflow triggers on Dependabot PRs to `develop`
  (push/PR trigger already covers `develop`; confirm no bot exclusion)
- [ ] 3. Verify lock sync: a sample bump PR's `bun.lock` passes
  `bun install --frozen-lockfile` under bun `1.4.4` in CI
- [ ] 4. Confirm no bump PR can target `main` directly (config has no
  default-branch entry; spot-check the first automated PRs)
- [ ] 5. Document the routing and lock-conflict rebase discipline in repo docs
