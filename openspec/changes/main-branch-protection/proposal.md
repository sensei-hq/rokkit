# main-branch-protection

Require the Check workflow to be green on pull requests targeting `main`.

## Why

`main` is the release branch: tags and publishes flow from it. The `Check`
workflow (`.github/workflows/check.yml`, jobs `check` and `browser`) already
triggers on pull requests to `main`, but nothing enforces its result — a PR
can merge while Type checks, lint, or browser specs are red, and the breakage
is discovered only at release time. Making green-Check a merge requirement
moves that discovery to the PR, where it is cheap to fix.

## What

Configure branch protection on `main` so that merging a PR requires the `Check`
workflow to have completed successfully:

- Required status checks: the `Check` workflow's `check` job (frozen install,
  theme build, `bun run check`, `bun run lint`) and `browser` job (Chromium
  component specs via `bun run test:browser`)
- Applies to all pull requests targeting `main`, including releases merged
  from `develop`

Out of scope: changing what the `Check` workflow itself runs, protecting
`develop`, auto-merge, or required reviewers (separate decisions).

## Impact

- Repository settings change only; no code, workflow-file, or lockfile edits
- Every PR to `main` must wait for both Check jobs; a red job blocks the merge
  until fixed or the PR is retargeted
- Release PRs from `develop` get the same guarantee automatically

## Risks

- **Job renames break protection silently**: if a job id in `check.yml` is
  renamed, the required-check rule referencing the old name stops matching;
  mitigate by re-verifying protection after any workflow edit.
- **Flaky browser specs block releases**: the `browser` job runs real Chromium;
  flakes become merge-blocking, so flakes must be fixed or quarantined rather
  than retried blindly.
- **Admin bypass**: if admins retain bypass permission, the guarantee is
  policy, not law; decide explicitly whether release admins may bypass and
  record the decision.
