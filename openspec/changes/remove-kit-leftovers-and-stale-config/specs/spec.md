# Spec: remove-kit-leftovers-and-stale-config

## Scenario: Root dead config is gone

Given the change is merged
When the reviewer lists the repo root
Then `svelte.config.js` and `vercel.json` do not exist
And the Cloudflare build still passes.

## Scenario: Cli exports resolve

Given the change is merged
When the reviewer inspects `packages/cli/package.json` exports
Then no entry points at the nonexistent `./lib/` directory
And knip reports no 'entry file not found' for the cli package.

## Scenario: Icons build invokes a real binary

Given the change is merged
When the reviewer inspects `packages/icons/package.json` build script
Then it invokes `rokkit`, matching the cli `bin` name
And the icons build runs green.
