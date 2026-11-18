# Spec: dependabot-routing

## Scenario: Bump PRs target develop

Given `.github/dependabot.yml` is merged
When Dependabot opens a version-bump PR
Then the PR's base branch is `develop`, never `main`.

## Scenario: Bump PRs prove lock sync in CI

Given an open Dependabot bump PR against `develop`
When the `Check` workflow runs on the PR head
Then `bun install --frozen-lockfile` under bun `1.4.4` succeeds, proving the
committed `bun.lock` matches the bumped manifests.

## Scenario: Bumps reach main only via release flow

Given a merged bump on `develop`
When a release PR merges `develop` into `main`
Then the bumped dependency and its lock update arrive on `main` together,
with the `Check` workflow green on the release PR.

## Scenario: No direct-to-main bump path remains

Given `.github/dependabot.yml` is merged
When the reviewer inspects the Dependabot configuration
Then every package-ecosystem entry sets `target-branch: develop`
And no entry targets `main` or relies on the default branch.
