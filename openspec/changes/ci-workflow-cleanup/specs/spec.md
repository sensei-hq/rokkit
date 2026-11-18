# ci-workflow-cleanup — acceptance

## Given the cleaned tree

- **Given** the workflows directory after the change
- **When** listing setup blocks and workflow names
- **Then** exactly one setup definition exists (the composite action),
  CI shows as `CI / check|browser|coverage`, and no file references
  `check.yml` or `coverage.yml` outside frozen history

## Given a PR to a protected branch

- **Given** branch protection requiring `check` + `browser`
- **When** CI runs on the PR
- **Then** check-runs named exactly `check` and `browser` report in,
  the merge gate is satisfiable, and no protection edit was needed
