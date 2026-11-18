# Spec: main-branch-protection

## Scenario: Red Check blocks merge to main

Given an open pull request targeting `main`
When the `Check` workflow's `check` or `browser` job fails on the PR's head
Then the PR is not mergeable until a green run completes on the same head
(except via the recorded admin-bypass policy, if any).

## Scenario: Pending Check blocks merge to main

Given an open pull request targeting `main`
When the `Check` workflow has not yet completed on the PR's head
Then the PR is not mergeable until both required jobs report success.

## Scenario: Green Check allows merge to main

Given an open pull request targeting `main`
When the `Check` workflow's `check` and `browser` jobs both succeed on the
PR's head
Then the status-check requirement is satisfied and the PR is mergeable
(subject to any other configured rules).

## Scenario: Protection survives workflow edits

Given branch protection is configured on `main`
When `.github/workflows/check.yml` is edited (without renaming job ids)
Then the required-check rule still matches the `check` and `browser` jobs on
the next PR to `main`.
