# Spec: dedupe-matchmedia-setup

## Scenario: One matchMedia mock for three packages

Given the change is merged
When the reviewer inspects `blocks`, `chart`, and `graph` spec setups
Then all three resolve the `matchMedia` mock from one shared module.

## Scenario: No local copy remains

Given the change is merged
When the reviewer lists `packages/{blocks,chart,graph}/spec/setup.js`
Then none contains its own `matchMedia` mock.

## Scenario: States setup untouched

Given the change is merged
When the reviewer inspects `packages/states/spec/setup.js`
Then its localStorage stub is unchanged.

## Scenario: All three suites stay green

Given the change is merged
When the blocks, chart, and graph suites run
Then all pass.
