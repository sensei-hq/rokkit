<script lang="ts">
	import ScreenShell from '../src/components/ScreenShell.svelte'
	import type { FilterApi, FilterState, PanelState } from '../src/types/screen-shell.js'

	let {
		panels = $bindable({}),
		filter = $bindable({ values: {}, stat: null }),
		withSidebar = false,
		withFilterSnippet = false,
		withFooterSnippet = false,
		withInfoSnippet = false,
		...rest
	}: Record<string, any> & {
		panels?: PanelState
		filter?: FilterState
	} = $props()

	const filters = $derived(withFilterSnippet ? filterBand : rest.filters)
	const info = $derived(withInfoSnippet ? [...(rest.info ?? []), infoColumn] : rest.info)
</script>

{#snippet side()}<p data-test-side>Side</p>{/snippet}
{#snippet foot()}<span data-test-foot>Foot</span>{/snippet}
{#snippet infoColumn()}<p data-test-info-snippet>Custom column</p>{/snippet}
{#snippet filterBand(api: FilterApi)}
	<span data-test-who>{api.values.who ?? ''}</span>
	<button type="button" data-test-set onclick={() => api.set('who', 'admin')}>admin</button>
	<button type="button" data-test-clear onclick={() => api.clear()}>reset</button>
{/snippet}

<ScreenShell
	{...rest}
	bind:panels
	bind:filter
	{filters}
	{info}
	sidebar={withSidebar ? side : undefined}
	footer={withFooterSnippet ? foot : rest.footer}
>
	<p data-test-body>Body</p>
</ScreenShell>
<output data-test-panels>{JSON.stringify(panels)}</output>
<output data-test-filter>{JSON.stringify(filter)}</output>
