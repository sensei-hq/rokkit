<script lang="ts">
	/**
	 * A table's page — or a stub's, which is table-shaped and whose point is what references it.
	 *
	 * Details: the comment, every field (type, PK/FK/NN/UNIQUE/ENUM/IDENTITY/GENERATED settings,
	 * default, what it references, its note), the foreign keys out and in, what reads, writes or
	 * calls it, its indexes and checks. Diagram: its neighbourhood in the ER graph, where a press
	 * on a neighbour walks to it.
	 *
	 * Reads a dbd-shaped design (`DesignModel`); a section whose data the model does not carry —
	 * the dependency graph above all — is left out rather than shown empty.
	 */
	import { Tabs } from '@rokkit/ui'
	import type { ProxyItem } from '@rokkit/states'
	import { vibe } from '@rokkit/states'
	import Neighborhood from '../diagrams/Neighborhood.svelte'
	import NoteBlocks from './NoteBlocks.svelte'
	import DesignHead from './DesignHead.svelte'
	import DepList from './DepList.svelte'
	import { toGraphInput } from './fromSchemaModel.js'
	import { tableDetail } from './details.js'
	import type { FieldBadge } from './details.js'
	import { nodeKey, readableKind, stubAt, withStubs } from './model.js'
	import type { DesignModel } from './model.js'
	import { pressTo } from './press.js'
	import { DEFAULT_ICONS } from '../icons.js'
	import { counted, say } from '../messages.js'
	import type { GraphMessageKey } from '../messages.js'
	import { interactions } from '../actions/interactions.js'

	let {
		model,
		entityKey,
		mode = undefined,
		onselect = undefined,
		class: className = ''
	}: {
		model: DesignModel
		/** `schema.name` of the table or stub to show. */
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

	const detail = $derived(tableDetail(model, entityKey))
	const tone = $derived(mode ?? (vibe.mode === 'dark' ? 'dark' : 'light'))
	const input = $derived(toGraphInput(withStubs(model), 'er'))
	const press = pressTo(() => onselect as ((key: string | null) => void) | undefined)

	const tabs = $derived([
		{ value: 'diagram', label: say('tabDiagram'), icon: DEFAULT_ICONS.schema },
		{ value: 'details', label: say('tabDetails'), icon: DEFAULT_ICONS.table }
	])

	const BADGES: Record<FieldBadge, GraphMessageKey> = {
		pk: 'badgePk',
		fk: 'badgeFk',
		nn: 'badgeNn',
		uq: 'badgeUq',
		enum: 'badgeEnum',
		identity: 'badgeIdentity',
		generated: 'badgeGenerated'
	}

	const STUB_REASONS: Record<string, GraphMessageKey> = {
		external: 'stubExternal',
		out_of_scope: 'stubOutOfScope'
	}

	const badges = $derived.by(() => {
		if (!detail) return []
		const { stub, table, outRefs, inRefs } = detail
		const size = stub
			? readableKind(stub.kind ?? '')
			: counted(table.columns.length, 'columnOne', 'columnMany')
		const refs =
			outRefs.length || inRefs.length
				? [say('refCounts', { out: outRefs.length, in: inRefs.length })]
				: []
		return [size, ...(table.module ? [table.module] : []), ...refs]
	})
</script>

{#snippet details()}
	{#if detail}
		{@const { table, stub, fields, outRefs, inRefs, usedBy } = detail}
		{@const note = table.noteMd ?? table.note}
		<div data-graph-design-body>
			<section data-graph-section="info">
				<h2 data-graph-section-title>{say('tableInfo')}</h2>
				{#if stub}
					<p data-graph-design-stub-reason>
						{say(STUB_REASONS[stub.kind ?? ''] ?? 'stubUnresolved')}
						{say('stubColumns')}
					</p>
				{/if}
				{#if note}
					<NoteBlocks {note} />
				{:else if !stub}
					<p data-graph-design-empty>{say('noTableComment')}</p>
				{/if}
			</section>

			<section data-graph-section="fields">
				<h2 data-graph-section-title>
					{say('fields')} <span data-graph-design-count>· {fields.length}</span>
				</h2>
				<div data-graph-design-scroll>
					<table data-graph-design-table data-graph-design-fields>
						<thead>
							<tr>
								<th>{say('fieldName')}</th>
								<th>{say('fieldType')}</th>
								<th>{say('fieldSettings')}</th>
								<th>{say('fieldDefault')}</th>
								<th>{say('fieldReferences')}</th>
								<th>{say('fieldNotes')}</th>
							</tr>
						</thead>
						<tbody>
							{#each fields as field (field.name)}
								<tr data-graph-design-field={field.name}>
									<td data-cell="name">{field.name}</td>
									<td data-cell="type">{field.type}</td>
									<td data-cell="settings">
										<span data-graph-column-badges>
											{#each field.badges as badge (badge)}
												<span data-row-badge={badge}>{say(BADGES[badge])}</span>
											{/each}
										</span>
									</td>
									<td data-cell="default" data-graph-design-muted={field.source ? undefined : ''}
										>{field.source ?? '—'}</td
									>
									<td data-cell="refs">
										{#each field.refs as ref (ref.label)}
											<button
												type="button"
												data-graph-design-link
												data-graph-press="select"
												data-graph-key={ref.key}>→ {ref.label}</button
											>
											{#if ref.stub}<span data-graph-design-stub>{readableKind(ref.stub)}</span
												>{/if}
										{:else}
											<span data-graph-design-muted>—</span>
										{/each}
									</td>
									<td data-cell="notes">
										{#if field.note}<NoteBlocks note={field.note} />{:else}<span
												data-graph-design-muted>—</span
											>{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<section data-graph-section="references">
				<h2 data-graph-section-title>
					{say('references')}
					<span data-graph-design-count>· {outRefs.length + inRefs.length}</span>
				</h2>
				{#if outRefs.length || inRefs.length}
					<div data-graph-design-list>
						{#each outRefs as ref, i (i)}
							{@const stubKind = stubAt(model, ref.to.s, ref.to.t)?.kind}
							<button
								type="button"
								data-graph-design-row
								data-graph-design-ref="out"
								data-graph-press="select"
								data-graph-key={nodeKey(ref.to.s, ref.to.t)}
							>
								<span data-graph-design-badge>{say('refOut')}</span>
								<span
									>{ref.from.c} → <span data-graph-design-strong>{ref.to.s}.{ref.to.t}</span>.{ref
										.to.c}</span
								>
								{#if stubKind}<span data-graph-design-stub>{readableKind(stubKind)}</span>{/if}
								{#if ref.action}<span data-graph-design-verb>{ref.action}</span>{/if}
							</button>
						{/each}
						{#each inRefs as ref, i (i)}
							<button
								type="button"
								data-graph-design-row
								data-graph-design-ref="in"
								data-graph-press="select"
								data-graph-key={nodeKey(ref.from.s, ref.from.t)}
							>
								<span data-graph-design-badge>{say('refIn')}</span>
								<span
									><span data-graph-design-strong>{ref.from.s}.{ref.from.t}</span>.{ref.from.c} → {ref
										.to.c}</span
								>
								{#if ref.action}<span data-graph-design-verb>{ref.action}</span>{/if}
							</button>
						{/each}
					</div>
				{:else}
					<p data-graph-design-empty>{say('noReferences')}</p>
				{/if}
			</section>

			{#if usedBy}
				<section data-graph-section="dependencies">
					<h2 data-graph-section-title>
						{say('dependencies')} <span data-graph-design-count>· {usedBy.length}</span>
					</h2>
					<DepList rows={usedBy} empty={say('noDependents')} />
				</section>
			{/if}

			{#if table.indexes?.length}
				<section data-graph-section="indexes">
					<h2 data-graph-section-title>
						{say('indexes')} <span data-graph-design-count>· {table.indexes.length}</span>
					</h2>
					{#each table.indexes as index, i (i)}
						<div data-graph-index>
							<span data-graph-index-def>{index.def}</span>
							{#if index.where}<span data-graph-design-muted
									>{say('indexWhere', { predicate: index.where })}</span
								>{/if}
							{#if index.unique}<span data-graph-index-unique>{say('badgeUq')}</span>{/if}
							{#if index.name}<span data-graph-index-name>{index.name}</span>{/if}
						</div>
					{/each}
				</section>
			{/if}

			{#if table.checks?.length}
				<section data-graph-section="checks">
					<h2 data-graph-section-title>
						{say('checks')} <span data-graph-design-count>· {table.checks.length}</span>
					</h2>
					{#each table.checks as check, i (i)}
						<div data-graph-index>
							<span data-graph-index-def>{check.expression}</span>
							{#if check.name}<span data-graph-index-name>{check.name}</span>{/if}
						</div>
					{/each}
				</section>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet panel(proxy: ProxyItem)}
	{#if proxy.value === tab}
		{#if tab === 'details'}
			{@render details()}
		{:else}
			<!-- `focus` drives the layout. A press on a neighbour walks to it; a press on the focus,
			     or the background's null, goes nowhere. -->
			<Neighborhood
				nodes={input.nodes}
				edges={input.edges}
				fields={input.fields}
				focus={entityKey}
				mode={tone}
				onselect={(id) => id && id !== entityKey && onselect?.(id)}
				controls
				label={say('relationshipsOf', { name: entityKey })}
			/>
		{/if}
	{/if}
{/snippet}

{#if detail}
	<div data-graph-design-page class={className} use:interactions={{ state: press }}>
		<DesignHead schema={detail.table.schema} name={detail.table.name} {badges} />
		<Tabs options={tabs} bind:value={tab} tabPanel={panel} />
	</div>
{:else}
	<div data-graph-design-page data-graph-design-missing class={className}>
		<p data-graph-design-empty>{say('entityNotFound')}</p>
	</div>
{/if}
