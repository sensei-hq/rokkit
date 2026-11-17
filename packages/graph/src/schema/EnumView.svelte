<script lang="ts">
	/**
	 * An enum's page: its note, its values in declaration order, and every column of its type —
	 * each opening the table it belongs to.
	 */
	import NoteBlocks from './NoteBlocks.svelte'
	import DesignHead from './DesignHead.svelte'
	import { enumDetail } from './details.js'
	import type { DesignModel } from './model.js'
	import { KIND_ICONS } from './entities.js'
	import { pressTo } from './press.js'
	import { counted, say } from '../messages.js'
	import { interactions } from '../actions/interactions.js'

	let {
		model,
		entityKey,
		onselect = undefined,
		class: className = ''
	}: {
		model: DesignModel
		/** `schema.name` of the enum to show. */
		entityKey: string
		/** The reader opened a table — its key. */
		onselect?: (key: string) => void
		class?: string
	} = $props()

	const detail = $derived(enumDetail(model, entityKey))
	const press = pressTo(() => onselect as ((key: string | null) => void) | undefined)
</script>

{#if detail}
	{@const en = detail.enum}
	{@const note = en.noteMd ?? en.note}
	<div data-graph-design-page class={className} use:interactions={{ state: press }}>
		<DesignHead
			schema={en.schema}
			name={en.name}
			badges={[
				'enum',
				...(en.module ? [en.module] : []),
				counted(en.values.length, 'valueOne', 'valueMany')
			]}
		/>
		<div data-graph-design-body>
			<section data-graph-section="info">
				<h2 data-graph-section-title>{say('info')}</h2>
				{#if note}
					<NoteBlocks {note} />
				{:else}
					<p data-graph-design-empty>{say('noComment', { kind: 'enum' })}</p>
				{/if}
			</section>
			<section data-graph-section="values">
				<h2 data-graph-section-title>
					{say('values')} <span data-graph-design-count>· {en.values.length}</span>
				</h2>
				<ol data-graph-design-list>
					{#each en.values as value, i (i)}
						<li data-graph-design-row data-graph-design-value={value}>
							<span data-graph-design-ordinal>{i + 1}</span>
							<span data-graph-design-strong>{value}</span>
						</li>
					{/each}
				</ol>
			</section>
			<section data-graph-section="used-by">
				<h2 data-graph-section-title>
					{say('usedBy')} <span data-graph-design-count>· {detail.columns.length}</span>
				</h2>
				{#if detail.columns.length}
					<div data-graph-design-list>
						{#each detail.columns as c (`${c.table  }.${  c.column}`)}
							<div data-graph-design-row data-graph-design-column>
								<span data-graph-design-row-icon class={KIND_ICONS.table} aria-hidden="true"></span>
								<!-- One qualified name: the flex gap must not split the table from its column. -->
								<span
									><button
										type="button"
										data-graph-design-link
										data-graph-press="select"
										data-graph-key={c.table}>{c.table}</button
									>.{c.column}</span
								>
							</div>
						{/each}
					</div>
				{:else}
					<p data-graph-design-empty>{say('noEnumColumns')}</p>
				{/if}
			</section>
		</div>
	</div>
{:else}
	<div data-graph-design-page data-graph-design-missing class={className}>
		<p data-graph-design-empty>{say('entityNotFound')}</p>
	</div>
{/if}
