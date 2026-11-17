<script lang="ts">
	/**
	 * A view's, materialized view's, function's, procedure's, trigger's or sequence's page.
	 *
	 * Details: its note, what it reads, writes and calls, and what uses it — both from the
	 * design's dependency graph. Diagram: its neighbourhood in that graph, not the ER one: a
	 * view's neighbours are what it reads. These kinds have no columns in the model, so there is
	 * no fields table.
	 */
	import { Tabs } from '@rokkit/ui'
	import type { ProxyItem } from '@rokkit/states'
	import { vibe } from '@rokkit/states'
	import Neighborhood from '../diagrams/Neighborhood.svelte'
	import NoteBlocks from './NoteBlocks.svelte'
	import DesignHead from './DesignHead.svelte'
	import DepList from './DepList.svelte'
	import { toGraphInput } from './fromSchemaModel.js'
	import { objectDetail } from './details.js'
	import { readableKind } from './model.js'
	import type { DesignModel } from './model.js'
	import { pressTo } from './press.js'
	import { DEFAULT_ICONS } from '../icons.js'
	import { say } from '../messages.js'
	import { interactions } from '../actions/interactions.js'

	let {
		model,
		entityKey,
		mode = undefined,
		onselect = undefined,
		class: className = ''
	}: {
		model: DesignModel
		/** `schema.name` of the object to show. */
		entityKey: string
		/** The diagram's palette; follows the page's `vibe.mode` when not set. */
		mode?: 'light' | 'dark'
		/** The reader opened another object — its key. */
		onselect?: (key: string) => void
		class?: string
	} = $props()

	let tab = $state('diagram')
	$effect(() => {
		void entityKey
		tab = 'diagram'
	})

	const detail = $derived(objectDetail(model, entityKey))
	const node = $derived(
		model.entities?.find(
			(e) => `${e.schema}.${e.name}` === entityKey && e.kind === detail?.entity.kind
		)
	)
	const note = $derived(node?.noteMd ?? node?.note)
	const tone = $derived(mode ?? (vibe.mode === 'dark' ? 'dark' : 'light'))
	const input = $derived(toGraphInput(model, 'dependencies'))
	const press = pressTo(() => onselect as ((key: string | null) => void) | undefined)

	const tabs = $derived([
		{ value: 'diagram', label: say('tabDiagram'), icon: DEFAULT_ICONS.schema },
		{ value: 'details', label: say('tabDetails'), icon: DEFAULT_ICONS.table }
	])
</script>

{#snippet details()}
	{#if detail}
		{@const kind = readableKind(detail.entity.kind)}
		<div data-graph-design-body>
			<section data-graph-section="info">
				<h2 data-graph-section-title>{say('info')}</h2>
				{#if note}
					<NoteBlocks {note} />
				{:else}
					<p data-graph-design-empty>{say('noComment', { kind })}</p>
				{/if}
			</section>
			<section data-graph-section="uses">
				<h2 data-graph-section-title>
					{say('uses')} <span data-graph-design-count>· {detail.uses.length}</span>
				</h2>
				<DepList rows={detail.uses} empty={say('usesNothing')} />
			</section>
			<section data-graph-section="used-by">
				<h2 data-graph-section-title>
					{say('usedBy')} <span data-graph-design-count>· {detail.usedBy.length}</span>
				</h2>
				<!-- A column default's `nextval('…')` is recorded as a call to `nextval`, never as a use
				     of the sequence, so for a sequence "nothing uses it" is not something the model knows. -->
				<DepList
					rows={detail.usedBy}
					empty={say(detail.entity.kind === 'sequence' ? 'sequenceUntraced' : 'usedByNothing')}
				/>
			</section>
		</div>
	{/if}
{/snippet}

{#snippet panel(proxy: ProxyItem)}
	{#if proxy.value === tab}
		{#if tab === 'details'}
			{@render details()}
		{:else}
			<Neighborhood
				nodes={input.nodes}
				edges={input.edges}
				fields={input.fields}
				focus={entityKey}
				mode={tone}
				onselect={(id) => id && id !== entityKey && onselect?.(id)}
				controls
				label={say('dependenciesOf', { name: entityKey })}
			/>
		{/if}
	{/if}
{/snippet}

{#if detail}
	<div data-graph-design-page class={className} use:interactions={{ state: press }}>
		<DesignHead
			schema={detail.entity.schema}
			name={detail.entity.name}
			badges={[
				readableKind(detail.entity.kind),
				...(detail.entity.module ? [detail.entity.module] : []),
				say('usageCounts', { uses: detail.uses.length, usedBy: detail.usedBy.length })
			]}
		/>
		<Tabs options={tabs} bind:value={tab} tabPanel={panel} />
	</div>
{:else}
	<div data-graph-design-page data-graph-design-missing class={className}>
		<p data-graph-design-empty>{say('entityNotFound')}</p>
	</div>
{/if}
