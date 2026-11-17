<script lang="ts">
	/**
	 * Every object of a design, by schema — and by module first in a workspace's model — as a
	 * rokkit `Tree`: each schema with its count, each object with its kind's icon. Above it, a
	 * search over names and a chip per kind the design has, with its count, that switches the
	 * kind on or off.
	 *
	 * Placement is the host's: `side` names the edge the sidebar sits on, and only decides which
	 * side its border is drawn.
	 */
	import { Tree } from '@rokkit/ui'
	import type { ProxyItem } from '@rokkit/states'
	import { sidebarTree } from './sidebar.js'
	import { KIND_ICONS, kindCounts, kindLabel } from './entities.js'
	import type { DesignKind } from './entities.js'
	import type { DesignModel } from './model.js'
	import { pressTo } from './press.js'
	import { say } from '../messages.js'
	import { choices } from '../actions/choices.js'
	import { interactions } from '../actions/interactions.js'

	let {
		model,
		value = $bindable(null),
		name = undefined,
		home = true,
		side = 'left',
		onselect = undefined,
		class: className = ''
	}: {
		model: DesignModel
		/** The selected object's key; `null` is the design itself. */
		value?: string | null
		/** The design's name, heading the tree; `model.project.name` when not given. */
		name?: string
		/** Whether the tree is headed by the design's own row; off when the host's page already is. */
		home?: boolean
		/** The edge the host placed the sidebar on. */
		side?: 'left' | 'right'
		/** An object's key, or `null` for the design's own row. */
		onselect?: (key: string | null) => void
		class?: string
	} = $props()

	let query = $state('')
	let hidden = $state<DesignKind[]>([])

	const title = $derived(home ? (name ?? model.project?.name) : undefined)
	const kinds = $derived(kindCounts(model))
	const items = $derived(sidebarTree(model, { query, hidden }))
	const press = pressTo(() => (key) => {
		value = key
		onselect?.(key)
	})

	function toggle(kind: string) {
		const k = kind as DesignKind
		hidden = hidden.includes(k) ? hidden.filter((h) => h !== k) : [...hidden, k]
	}

	/** Only an object is selected; a schema or module row folds and unfolds. */
	function pick(next: unknown, proxy: ProxyItem) {
		if (proxy.get('kind')) onselect?.(String(next))
	}

	const empty = $derived(
		kinds.length === 0
			? say('noEntities')
			: query.trim()
				? say('nothingMatches', { query: query.trim() })
				: say('allKindsOff')
	)
</script>

<aside
	data-graph-design-sidebar
	data-side={side}
	class={className}
	use:interactions={{ state: press }}
>
	{#if title}
		<button
			type="button"
			data-graph-design-home
			data-active={value ? undefined : ''}
			data-graph-press="clear"
			title={say('designHome')}>{title}</button
		>
	{/if}

	<div data-graph-design-search-box>
		<input
			type="search"
			data-graph-design-search
			placeholder={say('findEntity')}
			aria-label={say('findEntity')}
			bind:value={query}
		/>
	</div>

	{#if kinds.length > 0}
		<div
			data-graph-design-chips
			role="group"
			aria-label={say('showKinds')}
			use:choices={{ onchoose: toggle }}
		>
			{#each kinds as { kind, count } (kind)}
				<button
					type="button"
					data-graph-design-chip={kind}
					data-graph-choice={kind}
					aria-pressed={!hidden.includes(kind)}
				>
					<span class={KIND_ICONS[kind]} aria-hidden="true"></span>
					<span>{kindLabel(kind, count)}</span>
					<span data-graph-design-chip-count>{count}</span>
				</button>
			{/each}
		</div>
	{/if}

	<div data-graph-design-tree>
		{#if items.length}
			<Tree {items} bind:value onselect={pick} size="sm" />
		{:else}
			<p data-graph-design-empty>{empty}</p>
		{/if}
	</div>
</aside>
