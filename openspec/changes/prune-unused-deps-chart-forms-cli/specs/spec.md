# Spec: prune-unused-deps-chart-forms-cli

## Scenario: Chart manifest lists only used deps

Given the change is merged
When the reviewer inspects `packages/chart/package.json`
Then `@rokkit/states`, `d3-axis`, `d3-transition`, `@types/d3-axis`,
and `@types/d3-transition` are absent
And `README.md` no longer lists them.

## Scenario: Forms manifest drops ramda

Given the change is merged
When the reviewer inspects `packages/forms/package.json`
Then `ramda` and `@types/ramda` are absent.

## Scenario: Cli manifest drops iconify extras

Given the change is merged
When the reviewer inspects `packages/cli/package.json`
Then `@mdi/svg`, `@iconify/types`, and `iconify` are absent
And `@iconify/tools` remains.

## Scenario: Install and suite stay green

Given the change is merged
When `bun install --frozen-lockfile` and the full test suite run
Then both pass.
