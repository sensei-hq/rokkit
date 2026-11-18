# Spec: extract-focus-root-prelude

## Scenario: Unknown options still warn

Given a layout call with unknown options
When `resolveFocusRoot` runs via any of the 3 layouts
Then the same warning is emitted as before the extraction.

## Scenario: Missing focus node returns empty

Given a focus name with no matching node
When any of the 3 layouts resolves it
Then the layout returns the same empty result as before.

## Scenario: Single implementation owns the prelude

Given the change is merged
When the reviewer greps for the prelude body in `structure.ts`,
`sunburst.ts`, and `world.ts`
Then each file delegates to `resolveFocusRoot` with no inline copy left.

## Scenario: Graph suite stays green

Given the change is merged
When the graph package tests run
Then they pass with no new warnings.
