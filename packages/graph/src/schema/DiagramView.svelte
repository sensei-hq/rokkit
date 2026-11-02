<script lang="ts">
	/**
	 * A design's ER diagram: `ErDiagram` over the ER half — tables and their foreign keys, plus
	 * the stubs those keys land on outside the model — with the Names | Keys | All detail, the
	 * edge style, the zoom and the schema legend.
	 *
	 * Views, routines and triggers are the dependency half: a view is a derived projection and a
	 * routine is behaviour, so neither belongs on this canvas. An object's own page draws them.
	 */
	import { vibe } from '@rokkit/states'
	import ErDiagram from '../diagrams/ErDiagram.svelte'
	import { toGraphInput } from './fromSchemaModel.js'
	import { withStubs } from './model.js'
	import type { DesignModel } from './model.js'
	import type { Density, EdgeStyle } from '../layout/types.js'
	import { say } from '../messages.js'

	let {
		model,
		value = $bindable(null),
		density = $bindable('keys'),
		edgeStyle = $bindable('curved'),
		mode = undefined,
		label = undefined,
		onselect = undefined,
		class: className = ''
	}: {
		model: DesignModel
		/** The selected table's key. */
		value?: string | null
		density?: Density
		edgeStyle?: EdgeStyle
		/** The diagram's palette; follows the page's `vibe.mode` when not set. Without it the
		 *  schema tint resolves from the light ladder whatever the page is set to. */
		mode?: 'light' | 'dark'
		/** The canvas's accessible name; named for the design by default. */
		label?: string
		/** The reader pressed a table — its key — or the background (`null`). */
		onselect?: (key: string | null) => void
		class?: string
	} = $props()

	const input = $derived(toGraphInput(withStubs(model), 'er'))
	const tone = $derived(mode ?? (vibe.mode === 'dark' ? 'dark' : 'light'))
	const name = $derived(model.project?.name)
	const title = $derived(label ?? (name ? say('erDiagram', { name }) : say('erDiagramUnnamed')))
</script>

<ErDiagram
	nodes={input.nodes}
	edges={input.edges}
	fields={input.fields}
	bind:density
	bind:edgeStyle
	bind:value
	mode={tone}
	{onselect}
	controls
	legend
	label={title}
	class={className}
/>
