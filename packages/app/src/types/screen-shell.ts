/**
 * ScreenShell Types
 *
 * The data a screen hands its shell: a title bar (mark, title, context, search, toolbar), an
 * optional description, info / stats / filters bands, a body and a sidebar that each scroll on
 * their own, and a footer. The shell is layout only; it persists nothing — `panels` and
 * `filter` are bindable and the host stores them.
 */
import type { Snippet } from 'svelte'
import type { ToolbarItem } from '@rokkit/ui'

// =============================================================================
// Panels
// =============================================================================

/** The bands a screen can open and close from its toolbar, in toolbar order. */
export type PanelId = 'info' | 'stats' | 'filters' | 'side'

/** Which bands are open. A missing key is open, so a first visit opens everything. */
export type PanelState = Partial<Record<PanelId, boolean>>

/** Per-panel strings (toggle labels) or icon classes. */
export type PanelLabels = Record<PanelId, string>

// =============================================================================
// Marks
// =============================================================================

/** A screen's mark: the kanji, or the icon when the shell is in icon mode and one is given. */
export interface ShellMark {
	kanji: string
	icon?: string
}

/** Which glyph a mark draws: the text (kanji) or, when it has one, the icon. */
export type GlyphMode = 'text' | 'icon'

// =============================================================================
// Toolbar
// =============================================================================

/**
 * A screen's own button: an icon, its label as the tooltip and the accessible name. A
 * `disabled` string is the reason, shown with the label. A rokkit Toolbar `button` item.
 */
export interface ShellAction {
	id: string
	label: string
	icon: string
	onclick?: () => void
	href?: string
	busy?: boolean
	disabled?: string | boolean
	[key: string]: unknown
}

/**
 * The toolbar: the default (one toggle per band the view has) extended with `add` (left of the
 * toggles) and `remove` (drops a default by id); or a full list the screen owns.
 */
export type ToolbarSpec =
	| { add?: Array<ShellAction | ToolbarItem>; remove?: string[] }
	| ToolbarItem[]

// =============================================================================
// Info band
// =============================================================================

/** One step in an info column: a mark in a paper circle, a title and a line. */
export interface InfoStep {
	kanji: string
	icon?: string
	title: string
	text?: string
}

/**
 * One info column. `label` is the eyebrow and `text` the lead — the contract's minimum. A
 * column may also carry a large mark and a display title (the framing column), steps (the
 * how-to column) or a value with an optional total and progress (the stat column).
 */
export interface InfoColumn {
	label: string
	text?: string
	kanji?: string
	icon?: string
	title?: string
	steps?: InfoStep[]
	value?: string | number
	total?: string | number
	/** 0–1: how far along, drawn as a meter. */
	progress?: number
}

/** A column is data, or a snippet that draws it inside the band's column frame. */
export type InfoSlot = InfoColumn | Snippet

/** The role whose wash tints the info band. */
export type InfoRole =
	| 'accent'
	| 'primary'
	| 'secondary'
	| 'info'
	| 'success'
	| 'warning'
	| 'danger'

// =============================================================================
// Stats
// =============================================================================

export type ShellStatTone = 'ink' | 'danger' | 'warning' | 'success' | 'muted'

/** One stat card. With `filter` it is a toggle that sets the filter; with `href` a link. */
export interface ShellStat {
	id: string
	/** Shown capitalised by the theme, not typed in capitals. */
	title: string
	kanji?: string
	icon?: string
	value: string | number
	tone?: ShellStatTone
	description?: string
	/** Columns of 12 the card takes; computed from its content when absent. */
	span?: number
	filter?: { key: string; value: unknown }
	href?: string
}

// =============================================================================
// Filters
// =============================================================================

/** The filter values, the one source of truth, and the active stat's id. */
export interface FilterState {
	values: Record<string, unknown>
	stat?: string | null
}

/** What a filter band snippet is handed. `clear()` empties every value. */
export interface FilterApi {
	values: Record<string, unknown>
	set(key: string, value: unknown): void
	clear(): void
}

/** A filter band drawn by `@rokkit/forms` FormRenderer; `actions` are its toolbar. */
export interface FilterSchema {
	schema: Record<string, unknown>
	layout: Record<string, unknown>
	actions?: ShellAction[]
}

/** What the shell remembers about an applied stat, so clearing it restores the key. */
export interface StatMemory {
	/** The stat it was taken for; it applies only while that stat is the active one. */
	stat: string
	key: string
	had: boolean
	value: unknown
}

// =============================================================================
// Footer & strings
// =============================================================================

export interface FooterParts {
	left?: string
	mid?: string
	right?: string
}

export interface ScreenShellLabels extends PanelLabels {
	search: string
	fromStat: string
	clear: string
	reading: string
	busy: string
}

// =============================================================================
// Props
// =============================================================================

export interface ScreenShellProps {
	/** `<surface>.<area>[.<view>]` — the host keys its stored panels by it. */
	viewId?: string
	mark: ShellMark
	title: string
	context?: string
	description?: string
	/** On by default; `false` only for a view with nothing to search. Writes `values.q`. */
	search?: { placeholder?: string; delay?: number } | false
	toolbar?: ToolbarSpec
	info?: InfoSlot[]
	/** The info band's wash: the role it tints with (default `accent`). */
	infoRole?: InfoRole
	/** `null` = still reading (the band says so). */
	stats?: ShellStat[] | null
	filters?: Snippet<[FilterApi]> | FilterSchema
	sidebar?: Snippet
	/** Which side the sidebar sits on (default `right`). */
	sidebarSide?: 'left' | 'right'
	footer?: Snippet | FooterParts
	children: Snippet
	panels?: PanelState
	onpanels?: (next: PanelState) => void
	filter?: FilterState
	onfilter?: (next: FilterState) => void
	/** Draw marks as kanji (`text`, default) or as their icons (`icon`). */
	glyphs?: GlyphMode
	/** Toggle icon classes per band. */
	icons?: Partial<PanelLabels>
	/** String overrides; defaults come from `messages.screen`. */
	labels?: Partial<ScreenShellLabels>
	class?: string
}
