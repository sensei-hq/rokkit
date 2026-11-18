# Spec: prune-dead-exports-and-shims

## Scenario: Icons shims leave the published payload

Given the change is merged
When the icons package is packed
Then no `lib/**` shim file is in the payload
And every `*.json` entry point still resolves for existing consumers.

## Scenario: Dead constants and exports are gone

Given the change is merged
When the reviewer greps for `DEFAULT_EVENTS`,
`DEFAULT_VIBE_OPTIONS`, `DEFAULT_VIBE_PALETTE`, `isStrongMatch`,
`nextSuggestions`, `AA_NORMAL`, `AA_LARGE`, and `SCHEMA_FIELDS_LITE`
Then zero definitions remain and the full suite passes.

## Scenario: Helpers are module-private

Given the change is merged
When the reviewer inspects each D17 helper
Then it is no longer exported and its package's tests pass.

## Scenario: Live siblings untouched

Given the change is merged
When the reviewer inspects `vibe.svelte.js` consumers and the D24
verified-live symbols
Then `VALID_*`/`DEFAULT_STYLES` and every D24 symbol remain intact.
