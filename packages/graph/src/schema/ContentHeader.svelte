<script lang="ts">
	/**
	 * The head of a design: its name, its dialect, its counts (`6 tables · 1 enum · 5 refs`), the
	 * first paragraph of its note, and the design-level tabs.
	 *
	 * The tabs only report the reader's choice — the host renders the matching view below, so it
	 * decides what each tab shows. `tabs` defaults to Overview | Diagram | Entities; a host adds
	 * one (a changelog, say) by passing its own list.
	 */
	import { Tabs } from '@rokkit/ui'
	import { designTabs, headerStats } from './overview.js'
	import type { DesignTab } from './overview.js'
	import { splitLead } from './notes.js'
	import type { DesignModel } from './model.js'
	import { say } from '../messages.js'

	let {
		model,
		name = undefined,
		tabs = undefined,
		value = $bindable('overview'),
		onchange = undefined,
		class: className = ''
	}: {
		model: DesignModel
		/** The design's name; `model.project.name` when not given. */
		name?: string
		tabs?: DesignTab[]
		/** The active tab. */
		value?: string
		onchange?: (value: string) => void
		class?: string
	} = $props()

	const title = $derived(name ?? model.project?.name)
	const dialect = $derived(model.project?.db)
	const lead = $derived(splitLead(model.project?.note).lead)
	const stats = $derived(headerStats(model).join(' · '))
	const options = $derived(tabs ?? designTabs())
</script>

{#snippet nothing()}{/snippet}

<header data-graph-design-head data-graph-design-header class={className}>
	<div data-graph-design-heading>
		{#if title}<h1 data-graph-design-title>{title}</h1>{/if}
		{#if dialect}<span data-graph-design-badge data-graph-design-dialect>{dialect}</span>{/if}
		<span data-graph-design-stats>{stats}</span>
	</div>
	{#if lead}<p data-graph-design-lead>{lead}</p>{/if}
	<Tabs
		{options}
		bind:value
		name={say('designTabs')}
		tabPanel={nothing}
		onchange={(next) => onchange?.(String(next))}
	/>
</header>
