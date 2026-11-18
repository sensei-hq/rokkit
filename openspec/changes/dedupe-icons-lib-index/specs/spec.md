# Spec: dedupe-icons-lib-index

## Scenario: One source of truth for the lib shim

Given the change is merged
When the reviewer inspects `packages/icons/lib/*/index.js`
Then all 8 files delegate to one shared module or are declared generated
output of a checked-in generator.

## Scenario: Entry paths keep working

Given the change is merged
When each of the 8 lib entry paths is imported
Then every import resolves to the same behaviour as before.

## Scenario: Real consumers unaffected

Given the change is merged
When the repo test suite runs
Then the icons package tests and all `*.json` consumers (unocss
shortcuts/config) pass unchanged.
