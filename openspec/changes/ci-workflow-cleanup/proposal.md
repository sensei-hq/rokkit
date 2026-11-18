# ci-workflow-cleanup

Dedupe the GitHub Actions setup block, merge the CI workflows, and give
everything clearer names.

## Why

Four jobs (check, browser, coverage, publish) paste the same $\approx$15-line
setup block (checkout + bun + node + frozen install + themes build), so the
bun pin and the `--ignore-scripts` rationale each live in four places and
drift. Workflow/job names stutter (`Check / check`, `Coverage /
coverage`), `schedule.yml` says nothing about what it does, and
`ninja-i18n` floats on `@main` unpinned.

## What

- New composite action `.github/actions/setup/` — the single home for
  toolchain install + frozen install + optional themes build
- Merge `check.yml` + `coverage.yml` into `ci.yml` (name "CI") with jobs
  `check`, `browser`, `coverage` — job ids UNCHANGED so the branch
  protection contexts (`check`, `browser`) keep matching
- `schedule.yml` → `cleanup-runs.yml` ("Clean up old workflow runs")
- `ninja_i18n.yml` → `i18n-lint.yml` ("i18n lint"), action pinned to SHA,
  template comments trimmed; `pull_request_target` + permissions kept
- `publish.yml`, `deprecate.yml`: setup via the composite, otherwise kept
- Update the one live `check.yml` reference (TS7 migration backlog item);
  frozen journal history stays as-is

Out of scope: changing what CI runs (same gates, same triggers), required
checks on branches (contexts unchanged by design).

## Evidence

- Setup block ×4: `.github/workflows/{check.yml ×2 jobs, coverage.yml,
  publish.yml}` (bun pin comment + install + themes build)
- Stutters: workflow `Check` + job `check`, workflow `Coverage` + job
  `coverage`; vague `schedule.yml` / `Delete old workflow runs`
- Unpinned: `opral/ninja-i18n-action@main` in `ninja_i18n.yml:19`
- Protection contexts from live check-runs: `check`, `browser`
  (branch protection API, app_id 15368)

## Impact

- One place to bump bun/node; $\approx$60 duplicated lines removed
- CI reads as `CI / check|browser|coverage` in the UI
- No protection update needed (job ids preserved by design)

## Risks

- **Composite drift**: a future job hand-rolls setup instead of using
  the action — mitigate: the action is the only documented path.
- **Context mismatch**: if a job id is renamed by mistake, merges
  block — mitigate: verify job ids + re-GET protection before merge.
