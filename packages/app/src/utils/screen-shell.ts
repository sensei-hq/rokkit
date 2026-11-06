/**
 * ScreenShell — the pure rules behind the shell: which bands are open, what the toolbar holds,
 * how wide a stat card is, and how a stat's filter merges into the filter values.
 */
import type { ToolbarItem } from '@rokkit/ui'
import type {
	PanelId,
	PanelState,
	PanelLabels,
	ToolbarSpec,
	ShellAction,
	ShellAttrs,
	ShellStat,
	FilterState,
	StatMemory
} from '../types/screen-shell.js'

/** The bands a screen can toggle, in toolbar order. */
export const PANEL_IDS: readonly PanelId[] = ['info', 'stats', 'filters', 'side']

const isPanelId = (value: unknown): value is PanelId => PANEL_IDS.includes(value as PanelId)

// =============================================================================
// Panels
// =============================================================================

/** Whether a band is open: a missing key is open (first visit: everything open). */
export function isOpen(panels: PanelState | undefined, id: PanelId): boolean {
	return panels?.[id] !== false
}

/** The bands the view has, in toolbar order. */
export function presentPanels(has: Partial<Record<PanelId, boolean>>): PanelId[] {
	return PANEL_IDS.filter((id) => has[id])
}

/**
 * The whole panel state after one band flips, for the bands the view has. A band the view
 * does not have is never stored, open or closed.
 */
export function togglePanel(
	panels: PanelState | undefined,
	id: PanelId,
	present: PanelId[]
): PanelState {
	return Object.fromEntries(
		present.map((p) => [p, p === id ? !isOpen(panels, p) : isOpen(panels, p)])
	) as PanelState
}

// =============================================================================
// Toolbar
// =============================================================================

interface ToolbarContext {
	present: PanelId[]
	panels: PanelState | undefined
	labels: PanelLabels
	icons: PanelLabels
	/** Appended to a busy action's label. */
	busy?: string
	/** Attributes per band toggle, rendered on its toolbar button. */
	toggleAttrs?: Partial<Record<PanelId, ShellAttrs>>
}

const SEPARATOR: ToolbarItem = { type: 'separator' }

/** Why an action cannot run now: its disabled reason, else the busy note while it runs. */
function unavailableNote(action: ShellAction, busy: string): string {
	if (typeof action.disabled === 'string' && action.disabled) return action.disabled
	return action.busy ? busy : ''
}

/** A screen action (or any toolbar item) as a Toolbar item: value = id, a button by default. */
function toToolbarItem(item: ShellAction | ToolbarItem, busy = ''): ToolbarItem {
	const action = item as ShellAction
	const note = unavailableNote(action, busy)
	return {
		...item,
		value: item.value ?? item.id,
		type: item.type ?? 'button',
		label: note ? `${action.label} — ${note}` : action.label,
		disabled: Boolean(action.disabled || action.busy)
	}
}

/** A panel toggle with the band's attrs under its own (its own keys win). */
function withToggleAttrs(item: ToolbarItem, band: ShellAttrs | undefined): ToolbarItem {
	if (!band && item.attrs === undefined) return item
	return { ...item, attrs: { ...band, ...((item.attrs ?? {}) as ShellAttrs) } }
}

/** One toggle per band, pressed while the band is open. */
function panelToggle(id: PanelId, ctx: ToolbarContext): ToolbarItem {
	return withToggleAttrs(
		{
			id,
			value: id,
			type: 'toggle',
			icon: ctx.icons[id],
			label: ctx.labels[id],
			active: isOpen(ctx.panels, id)
		},
		ctx.toggleAttrs?.[id]
	)
}

/** A full list: kept as is, except a band toggle follows the band (dropped when it is absent). */
function resolveFullList(spec: ToolbarItem[], ctx: ToolbarContext): ToolbarItem[] {
	return spec
		.filter(
			(item) => item.type !== 'toggle' || !isPanelId(item.value) || ctx.present.includes(item.value)
		)
		.map((item) =>
			item.type === 'toggle' && isPanelId(item.value)
				? {
						...withToggleAttrs(item, ctx.toggleAttrs?.[item.value]),
						active: isOpen(ctx.panels, item.value)
					}
				: item.type === 'separator' || item.type === 'spacer'
					? item
					: toToolbarItem(item, ctx.busy)
		)
}

/**
 * The toolbar's items: the screen's own buttons, a separator, then one toggle per band the
 * view has (`info · stats · filters · side`), or the full list a screen passes.
 */
export function resolveToolbar(spec: ToolbarSpec | undefined, ctx: ToolbarContext): ToolbarItem[] {
	if (Array.isArray(spec)) return resolveFullList(spec, ctx)
	const { add = [], remove = [] } = spec ?? {}
	const removed = new Set<unknown>(remove)
	const toggles = ctx.present.filter((id) => !removed.has(id)).map((id) => panelToggle(id, ctx))
	const added = add
		.filter((item) => !removed.has(item.id))
		.map((item) => toToolbarItem(item, ctx.busy))
	const separator = added.length && toggles.length ? [SEPARATOR] : []
	return [...added, ...separator, ...toggles]
}

// =============================================================================
// Stats
// =============================================================================

/** Card width thresholds (characters) — the contract's stand-in for measuring the text. */
const SHORT_TITLE = 11
const SHORT_DESCRIPTION = 32
const SHORT_VALUE = 6
const MAX_SPAN = 12

/**
 * The columns (of 12) a stat card takes: a short title and no description → 1; a longer
 * title, a long value or a short description → 2; a description over 32 characters → 3. A
 * stat that names its span keeps it (1–12).
 */
export function statSpan(
	stat: Pick<ShellStat, 'title' | 'value' | 'description' | 'span'>
): number {
	if (stat.span) return Math.max(1, Math.min(MAX_SPAN, Math.round(stat.span)))
	const description = stat.description ?? ''
	if (description.length > SHORT_DESCRIPTION) return 3
	if (description || stat.title.length > SHORT_TITLE || String(stat.value).length > SHORT_VALUE)
		return 2
	return 1
}

// =============================================================================
// Filters
// =============================================================================

interface FilterStep {
	filter: FilterState
	memory: StatMemory | null
}

/** A copy of `values` with `key` set, or removed when it had none. */
function restore(values: Record<string, unknown>, memory: StatMemory) {
	const next = { ...values }
	if (memory.had) next[memory.key] = memory.value
	else delete next[memory.key]
	return next
}

/** The memory, when it is the active stat's; a memory taken for another stat is stale. */
function liveMemory(filter: FilterState, memory: StatMemory | null) {
	return memory && memory.stat === filter.stat ? memory : null
}

/** The filter key the active stat set: from the shell's memory, else from the stat itself. */
function activeKey(filter: FilterState, stats: ShellStat[], memory: StatMemory | null) {
	const live = liveMemory(filter, memory)
	if (live) return live.key
	return stats.find((s) => s.id === filter.stat)?.filter?.key
}

/**
 * Clear the active stat: its key goes back to the value it had before the stat was applied
 * (from `memory`), or is removed when the shell holds no memory for it.
 */
export function clearStat(
	filter: FilterState,
	stats: ShellStat[],
	memory: StatMemory | null
): FilterStep {
	if (!filter.stat) return { filter, memory: null }
	const key = activeKey(filter, stats, memory)
	const used =
		liveMemory(filter, memory) ??
		(key ? { stat: filter.stat, key, had: false, value: undefined } : null)
	const values = used ? restore(filter.values, used) : { ...filter.values }
	return { filter: { values, stat: null }, memory: null }
}

/**
 * Click a stat: apply its filter (set its key, mark it active), or — when it is already the
 * active one — clear it. A stat with no filter changes nothing. `stats` (the band) lets a
 * previously active stat the shell holds no memory for be cleared by its key.
 */
export function applyStat(
	filter: FilterState,
	stat: ShellStat,
	memory: StatMemory | null,
	stats: ShellStat[] = [stat]
): FilterStep {
	if (!stat.filter) return { filter, memory }
	if (filter.stat === stat.id) return clearStat(filter, stats, memory)
	const base = filter.stat ? clearStat(filter, stats, memory).filter : filter
	const { key, value } = stat.filter
	return {
		filter: { values: { ...base.values, [key]: value }, stat: stat.id },
		memory: { stat: stat.id, key, had: key in base.values, value: base.values[key] }
	}
}

/**
 * Set one filter value by hand. Changing the active stat's key clears the stat (the new value
 * stays); changing any other key leaves it active.
 */
export function setFilterValue(
	filter: FilterState,
	key: string,
	value: unknown,
	{ stats, memory }: { stats: ShellStat[]; memory: StatMemory | null }
): FilterStep {
	const values = { ...filter.values, [key]: value }
	const stat = filter.stat ?? null
	if (stat && activeKey(filter, stats, memory) === key)
		return { filter: { values, stat: null }, memory: null }
	return { filter: { values, stat }, memory }
}

/** The keys whose value differs between two value maps (added and removed keys included). */
export function changedKeys(
	before: Record<string, unknown>,
	after: Record<string, unknown>
): string[] {
	const keys = new Set([...Object.keys(before), ...Object.keys(after)])
	return [...keys].filter((key) => !Object.is(before[key], after[key]))
}
