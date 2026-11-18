# Spec: dedupe-input-spec-factory

## Scenario: All input specs share one factory

Given the change is merged
When the reviewer inspects the ~14 input specs
Then each delegates its boilerplate block to the shared factory with no
inline copy left.

## Scenario: No test case is lost

Given the baseline per-file test counts
When the forms suite runs after repointing
Then every file's count matches its baseline exactly.

## Scenario: No production code changes

Given the change is merged
When the reviewer inspects the diff
Then only files under `packages/forms/spec/` are touched.
