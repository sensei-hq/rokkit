# Spec: extract-shell-demo-init

## Scenario: Helper initialises the shell for a demo id

Given `initShellDemo` is imported from `#lib/koan/shell.svelte.ts`
When a demo page calls `initShellDemo('button')` on mount
Then `shell.lastQuery` defaults to the demo's query when unset
And `setShellResponse('button')` is invoked exactly as the inline block did.

## Scenario: Effect variant keeps its semantics

Given a page that used the 13-line `$effect` variant
When it is repointed at `initShellDemo(id, 'effect')` (or equivalent)
Then the reactive re-run behaviour matches the original block.

## Scenario: No inline boilerplate remains

Given all `routes/app` pages are repointed
When the reviewer greps for the inline `onMount` shell block under
`apps/learn/src/routes/app/`
Then zero pages contain it.

## Scenario: Suite and build stay green

Given the extraction is merged
When the learn unit suite and production build run
Then both pass with no new warnings.
