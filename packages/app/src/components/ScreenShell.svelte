<script lang="ts">
	/**
	 * One screen, laid out from data: a title bar (mark, title, context, then search, the
	 * screen's own buttons and the band toggles), a description, the info / stats / filters
	 * bands, a body and a sidebar that each scroll on their own, and a footer. The shell fills
	 * its container; nothing but the body and the sidebar scrolls.
	 *
	 * Layout only, and it persists nothing: `panels` and `filter` are bindable (and emitted
	 * through `onpanels` / `onfilter`); the host stores them by `viewId`.
	 */
	import { untrack, type Snippet } from 'svelte'
	import { StatCard, Toolbar, type ToolbarItem } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import { messages } from '@rokkit/states'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import ScreenInfo from './ScreenInfo.svelte'
	import type {
		FilterApi,
		FilterSchema,
		FilterState,
		FooterParts,
		PanelId,
		PanelLabels,
		ScreenShellProps,
		ShellStat,
		StatMemory
	} from '../types/screen-shell.js'
	import {
		PANEL_IDS,
		applyStat,
		changedKeys,
		clearStat,
		isOpen,
		presentPanels,
		resolveToolbar,
		setFilterValue,
		statSpan,
		togglePanel
	} from '../utils/screen-shell.js'

	const DEFAULT_ICONS: PanelLabels = {
		info: DEFAULT_STATE_ICONS.state.info,
		stats: DEFAULT_STATE_ICONS.view.chart,
		filters: 'i-glyph:search-filter',
		side: 'i-glyph:sidebar'
	}
	const SEARCH_DELAY = 250

	let {
		viewId,
		mark,
		title,
		context,
		description,
		search = {},
		toolbar,
		info,
		infoRole = 'accent',
		stats,
		filters,
		sidebar,
		sidebarSide = 'right',
		footer,
		children,
		panels = $bindable({}),
		onpanels,
		filter = $bindable({ values: {}, stat: null }),
		onfilter,
		glyphs = 'text',
		icons,
		labels,
		class: className = ''
	}: ScreenShellProps = $props()

	const text = $derived({ ...messages.screen, ...labels })
	const values = $derived(filter?.values ?? {})
	const statList = $derived(stats ?? [])

	// ─── Panels ────────────────────────────────────────────────────

	const has = $derived<Record<PanelId, boolean>>({
		info: Boolean(info?.length),
		stats: stats !== undefined,
		filters: Boolean(filters),
		side: Boolean(sidebar)
	})
	const present = $derived(presentPanels(has))
	const shown = (id: PanelId) => has[id] && isOpen(panels, id)

	function flip(id: PanelId) {
		const next = togglePanel(panels, id, present)
		panels = next
		onpanels?.(next)
	}

	// ─── Toolbar ───────────────────────────────────────────────────

	const items = $derived(
		resolveToolbar(toolbar, {
			present,
			panels,
			labels: text,
			icons: { ...DEFAULT_ICONS, ...icons },
			busy: text.busy
		})
	)

	function runItem(value: unknown, item: ToolbarItem) {
		if (item.type === 'toggle' && PANEL_IDS.includes(value as PanelId))
			return flip(value as PanelId)
		;(item.onclick as (() => void) | undefined)?.()
		if (typeof item.href === 'string') window.location.assign(item.href)
	}

	// ─── Filter ────────────────────────────────────────────────────

	let memory: StatMemory | null = null

	function commit(step: { filter: FilterState; memory: StatMemory | null }) {
		memory = step.memory
		filter = step.filter
		onfilter?.(step.filter)
	}

	const current = (): FilterState => ({ values, stat: filter?.stat ?? null })
	const setValue = (key: string, value: unknown) =>
		commit(setFilterValue(current(), key, value, { stats: statList, memory }))
	const clearValues = () => commit({ filter: { values: {}, stat: null }, memory: null })
	const clearActive = () => commit(clearStat(current(), statList, memory))
	const pickStat = (stat: ShellStat) => commit(applyStat(current(), stat, memory, statList))

	const api: FilterApi = {
		get values() {
			return values
		},
		set: setValue,
		clear: clearValues
	}

	/** A FormRenderer update: every key that changed goes through the same merge rule. */
	function updateFromForm(next: Record<string, unknown>) {
		for (const key of changedKeys(values, next)) setValue(key, next[key])
	}

	const formData = $derived({ ...values })
	const activeStat = $derived(statList.find((s) => s.id === filter?.stat && s.filter))
	const filterSchema = $derived(
		filters && typeof filters !== 'function' ? (filters as FilterSchema) : null
	)
	const filterSnippet = $derived(
		typeof filters === 'function' ? (filters as Snippet<[FilterApi]>) : null
	)
	const filterActions = $derived(
		resolveToolbar(
			{ add: filterSchema?.actions ?? [] },
			{
				present: [],
				panels,
				labels: text,
				icons: { ...DEFAULT_ICONS, ...icons },
				busy: text.busy
			}
		)
	)

	// ─── Search ────────────────────────────────────────────────────

	const searchOn = $derived(search !== false)
	const placeholder = $derived((search && search.placeholder) || text.search)
	const delay = $derived(search ? (search.delay ?? SEARCH_DELAY) : SEARCH_DELAY)
	let query = $state(untrack(() => String(filter?.values?.q ?? '')))
	let timer: ReturnType<typeof setTimeout> | undefined

	// A q set from outside (a restored filter, a reset) shows in the field — but not while the
	// user's own text is still waiting out the debounce.
	$effect(() => {
		const q = String(values.q ?? '')
		untrack(() => {
			if (timer === undefined && q !== query) query = q
		})
	})

	$effect(() => () => clearTimeout(timer))

	function onsearch() {
		clearTimeout(timer)
		timer = setTimeout(() => {
			timer = undefined
			setValue('q', query)
		}, delay)
	}

	// ─── Stats & footer ────────────────────────────────────────────

	const reserve = $derived(statList.some((s) => Boolean(s.description)))
	const footerParts = $derived(
		footer && typeof footer !== 'function' ? (footer as FooterParts) : null
	)
	const footerSnippet = $derived(typeof footer === 'function' ? (footer as Snippet) : null)
	const FOOTER_PARTS = ['left', 'mid', 'right'] as const
</script>

{#snippet glyph(kanji: string, icon: string | undefined)}
	{#if glyphs === 'icon' && icon}
		<span data-screen-mark class={icon} aria-hidden="true"></span>
	{:else}
		<span data-screen-mark aria-hidden="true">{kanji}</span>
	{/if}
{/snippet}

{#snippet side()}
	{#if sidebar && shown('side')}
		<aside data-screen-sidebar data-side={sidebarSide} aria-label={text.side}>
			{@render sidebar()}
		</aside>
	{/if}
{/snippet}

<div data-screen-shell data-view={viewId} class={className || undefined}>
	<header data-screen-header>
		<div data-screen-titlebar>
			{@render glyph(mark.kanji, mark.icon)}
			<h1 data-screen-title>{title}</h1>
			{#if context}<span data-screen-context>{context}</span>{/if}
			{#if searchOn || items.length}
				<div data-screen-tools>
					{#if searchOn}
						<label data-screen-search>
							<span
								data-screen-search-icon
								class={DEFAULT_STATE_ICONS.action.search}
								aria-hidden="true"
							></span>
							<input
								type="search"
								bind:value={query}
								oninput={onsearch}
								{placeholder}
								aria-label={placeholder}
							/>
						</label>
					{/if}
					{#if items.length}
						<Toolbar {items} label={title} width="fit" showDividers={false} onclick={runItem} />
					{/if}
				</div>
			{/if}
		</div>
		{#if description}<p data-screen-description>{description}</p>{/if}

		{#if info?.length && shown('info')}
			<ScreenInfo columns={info} role={infoRole} {glyphs} />
		{/if}

		{#if stats !== undefined && shown('stats')}
			<div data-screen-stats aria-label={text.stats} role="group">
				{#if stats === null}
					<p data-screen-stats-reading>{text.reading}</p>
				{:else}
					{#each stats as stat (stat.id)}
						<StatCard
							label={stat.title}
							value={stat.value}
							tone={stat.tone}
							description={stat.description}
							reserveDescription={reserve}
							span={statSpan(stat)}
							href={stat.filter ? undefined : stat.href}
							icon={glyphs === 'icon' ? stat.icon : undefined}
							mark={stat.kanji}
							onclick={stat.filter ? () => pickStat(stat) : undefined}
							pressed={filter?.stat === stat.id}
							data-stat={stat.id}
						/>
					{/each}
				{/if}
			</div>
		{/if}

		{#if filters && shown('filters')}
			<div data-screen-filters role="group" aria-label={text.filters}>
				{#if filterSnippet}
					{@render filterSnippet(api)}
				{:else if filterSchema}
					<FormRenderer
						data={formData}
						schema={filterSchema.schema}
						layout={filterSchema.layout}
						onupdate={updateFromForm}
					/>
					{#if filterActions.length}
						<div data-screen-filter-actions>
							<Toolbar items={filterActions} label={text.filters} width="fit" onclick={runItem} />
						</div>
					{/if}
				{/if}
				{#if activeStat}
					<span data-screen-filter-chip>
						{text.fromStat}: <strong>{activeStat.title}</strong>
						<button type="button" onclick={clearActive}>{text.clear}</button>
					</span>
				{/if}
			</div>
		{/if}
	</header>

	<div data-screen-main>
		{#if sidebarSide === 'left'}{@render side()}{/if}
		<div data-screen-body role="region" aria-label={title}>
			{@render children()}
		</div>
		{#if sidebarSide !== 'left'}{@render side()}{/if}
	</div>

	{#if footerSnippet}
		<footer data-screen-footer>{@render footerSnippet()}</footer>
	{:else if footerParts}
		<footer data-screen-footer>
			{#each FOOTER_PARTS as part (part)}
				{#if footerParts[part]}<span data-part={part}>{footerParts[part]}</span>{/if}
			{/each}
		</footer>
	{/if}
</div>
