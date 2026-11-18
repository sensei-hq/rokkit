# Spec: dedupe-css-spec-header

## Scenario: All css specs share one header

Given the change is merged
When the reviewer inspects the 6 `*-css.spec.js` files
Then each delegates its header to the shared helper with no inline copy.

## Scenario: No test case is lost

Given the baseline per-file test counts
When the themes suite runs after repointing
Then every file's count matches its baseline exactly.

## Scenario: No production code changes

Given the change is merged
When the reviewer inspects the diff
Then only files under `packages/themes/spec/` are touched.
