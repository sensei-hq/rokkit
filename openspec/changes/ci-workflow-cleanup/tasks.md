# Tasks — ci-workflow-cleanup

- [ ] Add `.github/actions/setup/action.yml` (bun 1.4.4 + node 24.x + frozen install + optional themes build)
- [ ] Merge `check.yml` + `coverage.yml` into `ci.yml` (jobs `check`, `browser`, `coverage` — ids unchanged); delete old files
- [ ] Point `publish.yml` setup at the composite (`build-themes: false`)
- [ ] Rename `schedule.yml` → `cleanup-runs.yml`, `ninja_i18n.yml` → `i18n-lint.yml`; pin ninja SHA; trim comments
- [ ] Update the live `check.yml` reference in the TS7 backlog item
- [ ] Validate with `actionlint`; confirm job ids `check`/`browser` preserved
- [ ] Open PR to `develop`, wait for CI green (validates composite + renames live), merge
- [ ] Re-GET branch protection on `main` + `develop` to confirm contexts still match
