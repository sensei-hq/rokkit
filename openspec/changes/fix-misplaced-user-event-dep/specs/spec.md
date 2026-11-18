# Spec: fix-misplaced-user-event-dep

## Scenario: Forms declares what it imports

Given the change is merged
When the reviewer inspects `packages/forms/package.json`
Then `@testing-library/user-event` is in devDependencies at the same
version the root manifest previously pinned.

## Scenario: Root no longer carries the phantom dep

Given the change is merged
When the reviewer inspects root `package.json`
Then `@testing-library/user-event` is absent.

## Scenario: Forms suite passes on declared deps only

Given the change is merged
When the forms suite runs after a frozen install
Then all `user-event`-importing specs pass.
