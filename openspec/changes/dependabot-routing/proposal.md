# dependabot-routing

Route dependency bumps through `develop` with lockfile sync instead of
direct-to-`main`.

## Why

There is currently no Dependabot configuration in the repo (verified: no
`.github/dependabot.yml`), so any automated bump defaults to targeting the
default branch — `main` — bypassing the `develop` integration branch where
PRs are built, type-checked, and tested together. A bump merged straight to
`main` also risks `bun.lock` drift: the lockfile is pinned to bun `1.4.4`
(`packageManager` + `check.yml` pin agree), and a bump whose lock update was
produced by a different bun fails the `--frozen-lockfile` gate. Routing bumps
through `develop` makes each one prove itself against the full Check workflow
— frozen install included — before it can ride a release PR to `main`.

## What

- Add `.github/dependabot.yml` with `target-branch: develop` for the package
  ecosystem (bun/npm), on a weekly schedule with grouped minor/patch updates
- Each bump PR therefore targets `develop`, where the existing `Check`
  workflow (which triggers on PRs to `develop`) enforces frozen-install,
  lint, type checks, app builds, unit tests, and browser specs
- Bumps reach `main` only via the normal `develop` -> `main` release flow,
  behind the `main` branch protection from `main-branch-protection`
- Document the routing (why bumps target `develop`, who rebases on lock
  conflicts) in repo docs

Out of scope: versioning policy (which bumps auto-merge, if any), Dependabot
auto-merge itself, and security-advisory triage process.

## Impact

- One new file: `.github/dependabot.yml`
- Bump PRs appear against `develop` instead of `main`; reviewers handle them
  in the normal PR queue with full CI signal
- Lock conflicts between concurrent bump PRs are resolved by rebase on
  `develop`, never by hand-editing the lockfile on `main`

## Risks

- **Lock-conflict churn**: several open bump PRs can conflict on `bun.lock`;
  mitigate with grouped updates and rebase-before-merge discipline.
- **Bun-version skew**: if Dependabot's bun differs from pinned `1.4.4`, its
  lock update may fail `--frozen-lockfile` in CI; if observed, pin or
  regenerate the lock in a follow-up commit on the same PR.
- **Noise**: weekly bumps add PR volume; grouping and scoped directory config
  keep it to a small number of reviewable PRs.
