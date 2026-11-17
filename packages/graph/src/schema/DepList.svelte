<script lang="ts">
	/**
	 * Dependencies, one per row: the other end — opened by a press when it is an object of the
	 * design, plain text when it is not — its kind, and the verb. An unresolved end is dimmed, not
	 * dropped: the edge is real, only its target is not placeable. Internal.
	 *
	 * Presses are read by the page's `interactions` action through `data-graph-press`.
	 */
	import { KIND_ICONS } from './entities.js'
	import { readableKind } from './model.js'
	import type { DepRow } from './details.js'
	import { say } from '../messages.js'

	let { rows, empty }: { rows: DepRow[]; empty: string } = $props()
</script>

{#if rows.length}
	<div data-graph-design-list>
		{#each rows as row, i (`${row.key  }:${  row.verb  }:${  i}`)}
			<div
				data-graph-design-row
				data-graph-design-dep={row.key}
				data-unresolved={row.unresolved || undefined}
				title={row.unresolved ? say('notDefined') : undefined}
			>
				{#if row.kind}<span
						data-graph-design-row-icon
						class={KIND_ICONS[row.kind]}
						aria-hidden="true"
					></span>{/if}
				{#if row.known}
					<button
						type="button"
						data-graph-design-link
						data-graph-press="select"
						data-graph-key={row.key}>{row.key}</button
					>
				{:else}
					<span data-graph-design-strong>{row.key}</span>
				{/if}
				{#if row.kind}<span data-graph-design-badge>{readableKind(row.kind)}</span>{/if}
				<span data-graph-design-verb>{row.verb}</span>
			</div>
		{/each}
	</div>
{:else}
	<p data-graph-design-empty>{empty}</p>
{/if}
