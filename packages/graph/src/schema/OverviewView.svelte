<script lang="ts">
	/**
	 * A design at a glance: its dialect, a card for each kind it has — counted and iconed the
	 * way the diagram draws each kind — the rest of its note, and the same counts per schema.
	 *
	 * A count or column the model does not carry is left out, never shown as 0. A host that shows
	 * the counts elsewhere (its own header) turns them off with `counts={false}`.
	 */
	import { StatCard } from '@rokkit/ui'
	import NoteBlocks from './NoteBlocks.svelte'
	import { databaseLabel, overviewCounts, schemaRows } from './overview.js'
	import { splitLead } from './notes.js'
	import type { DesignModel } from './model.js'
	import { DEFAULT_ICONS } from '../icons.js'
	import { say } from '../messages.js'

	let {
		model,
		counts: showCounts = true,
		class: className = ''
	}: { model: DesignModel; counts?: boolean; class?: string } = $props()

	const counts = $derived(overviewCounts(model))
	const schemas = $derived(schemaRows(model))
	const dialect = $derived(databaseLabel(model.project?.db))
	// The header shows the note's first paragraph; this shows what follows it.
	const rest = $derived(splitLead(model.project?.note).rest)
	const withEnums = $derived(schemas.some((s) => s.enums !== undefined))
	const withOther = $derived(schemas.some((s) => s.other !== undefined))
	const dash = (n: number | undefined) => (n ? String(n) : '—')
</script>

<div data-graph-design-page data-graph-design-overview class={className}>
	<div data-graph-design-body>
		{#if showCounts}
			<section data-graph-section="counts">
				<h2 data-graph-section-title>{say('atAGlance')}</h2>
				{#if dialect || model.version}
					<p data-graph-design-line>
						{#if dialect}
							<span data-graph-design-row-icon class={DEFAULT_ICONS.database} aria-hidden="true"
							></span>
							<span data-graph-design-dialect>{dialect}</span>
						{/if}
						{#if model.version}<span data-graph-design-badge data-graph-design-version
								>{say('modelVersion', { n: model.version })}</span
							>{/if}
					</p>
				{/if}
				<div data-stat-cards>
					{#each counts as c (c.key)}
						<StatCard label={c.label} value={c.count} icon={c.icon} data-graph-design-card={c.key} />
					{/each}
				</div>
			</section>
		{/if}

		{#if rest.length}
			<section data-graph-section="notes">
				<h2 data-graph-section-title>{say('notes')}</h2>
				<NoteBlocks blocks={rest} />
			</section>
		{/if}

		<section data-graph-section="schemas">
			<h2 data-graph-section-title>
				{say('kindSchemaMany')} <span data-graph-design-count>· {schemas.length}</span>
			</h2>
			{#if schemas.length}
				<div data-graph-design-scroll>
					<table data-graph-design-table>
						<thead>
							<tr>
								<th>{say('schemaName')}</th>
								<th>{say('schemaTables')}</th>
								{#if withEnums}<th>{say('schemaEnums')}</th>{/if}
								{#if withOther}<th>{say('schemaRoutines')}</th>{/if}
							</tr>
						</thead>
						<tbody>
							{#each schemas as s (s.name)}
								<tr data-graph-design-schema-row={s.name}>
									<td
										><span
											data-graph-design-row-icon
											class={DEFAULT_ICONS.schema}
											aria-hidden="true"
										></span><span data-graph-design-strong>{s.name}</span></td
									>
									<td>{s.tables}</td>
									{#if withEnums}<td>{dash(s.enums)}</td>{/if}
									{#if withOther}<td>{dash(s.other)}</td>{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p data-graph-design-empty>{say('noSchemas')}</p>
			{/if}
		</section>
	</div>
</div>
