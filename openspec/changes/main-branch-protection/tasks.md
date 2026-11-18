# Tasks: main-branch-protection

- [ ] 1. Confirm the `Check` workflow job ids (`check`, `browser`) in
  `.github/workflows/check.yml`
- [ ] 2. Decide and record the admin-bypass policy for `main` (allowed or not)
- [ ] 3. Enable branch protection on `main` with the `Check` workflow's `check`
  and `browser` jobs as required status checks
- [ ] 4. Verify with a test PR to `main`: red Check blocks merge, green Check
  allows merge
- [ ] 5. Document the requirement (repo docs / contributing notes) and close
  out the change
