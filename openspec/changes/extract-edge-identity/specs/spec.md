# Spec: extract-edge-identity

## Scenario: Identity output is pinned

Given representative routed edges
When `edgeIdentity(edge, i)` computes their identity
Then the output equals the pre-extraction output for every fixture.

## Scenario: Single implementation owns edge identity

Given the change is merged
When the reviewer greps for the identity-fields block across
`packages/graph/src/layout/`
Then exactly one implementation exists and all 6 sites call it.

## Scenario: Graph suite stays green

Given the change is merged
When the graph package tests run
Then they pass with no new warnings.
