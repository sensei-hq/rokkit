<script lang="ts">
	/**
	 * The database-design viewer, composed from `@rokkit/graph/schema` the way dbd's site and
	 * sensei's app compose it: the design's head and tabs, the view the tab names, and the
	 * sidebar — on the RIGHT here, because placement is the host's.
	 *
	 * Selecting an object in the sidebar or on a page opens its page; `pageFor` says which.
	 */
	import {
		ContentHeader,
		DiagramView,
		EntitiesView,
		EnumView,
		ObjectView,
		OverviewView,
		SchemaSidebar,
		TableView,
		pageFor,
		toGraphInput
	} from '@rokkit/graph/schema'
	import type { DesignModel } from '@rokkit/graph/schema'
	import { ecommerceSchema } from './datasets'

	const model: DesignModel = {
		...ecommerceSchema,
		project: {
			name: 'ecommerce',
			db: 'postgresql',
			note: 'A storefront: customers, their orders and the products they buy.'
		}
	}
	const entities = toGraphInput(model, 'er')

	let selected = $state<string | null>(null)
	let tab = $state('overview')
	const page = $derived(selected ? pageFor(model, selected) : undefined)
	const open = (key: string | null) => (selected = key)
</script>

<div class="viewer">
	<main class="main">
		{#if selected && page === 'table'}
			<TableView {model} entityKey={selected} onselect={open} />
		{:else if selected && page === 'object'}
			<ObjectView {model} entityKey={selected} onselect={open} />
		{:else if selected && page === 'enum'}
			<EnumView {model} entityKey={selected} onselect={open} />
		{:else}
			<ContentHeader {model} bind:value={tab} />
			<div class="view">
				{#if tab === 'diagram'}
					<DiagramView {model} onselect={(key: string | null) => key && open(key)} />
				{:else if tab === 'entities'}
					<div class="scroll">
						<EntitiesView nodes={entities.nodes} edges={entities.edges} fields={entities.fields} />
					</div>
				{:else}
					<OverviewView {model} />
				{/if}
			</div>
		{/if}
	</main>
	<SchemaSidebar {model} bind:value={selected} side="right" onselect={open} />
</div>

<style>
	.viewer {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 16rem;
		height: 100%;
		min-height: 34rem;
	}

	.main {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	.view {
		position: relative;
		flex: 1;
		min-height: 0;
	}

	.scroll {
		height: 100%;
		overflow: auto;
		padding: 0.75rem 1.5rem;
	}
</style>
