/**
 * StatCard Component Types
 */
import type { Snippet } from 'svelte'

/** The tone a number is read in; none (or `ink`) is the plain ink. */
export type StatCardTone = 'ink' | 'danger' | 'warning' | 'success' | 'muted'

/** Props for the StatCard component. */
export interface StatCardProps {
	/** What the number counts. */
	label: string

	/** The number, or a value already written as text (e.g. `12 · 30`). */
	value: number | string

	/** An icon class (e.g. `i-glyph:table`) drawn before the label. Wins over `mark`. */
	icon?: string

	/** A text mark (e.g. a kanji) drawn before the label, or a snippet that draws one. */
	mark?: string | Snippet

	/** An optional second line under the value; at most two lines are shown. */
	description?: string

	/**
	 * Keep the two-line description space even without a description, so the cards of a band
	 * line up when any of them has one.
	 */
	reserveDescription?: boolean

	/** The tone the value is read in. */
	tone?: StatCardTone

	/** Where the value leads, when something shows it. The whole card is the target. */
	href?: string

	/** Makes the card a button; with `pressed` it is a toggle (`aria-pressed`). */
	onclick?: (event: MouseEvent) => void

	/** Whether an interactive card is pressed (active). Ignored without `onclick`. */
	pressed?: boolean

	/** How many grid columns the card spans (`--stat-card-span`, read by the grid). */
	span?: number

	/** Additional CSS class names. */
	class?: string

	/** Data attributes a host marks the card with (e.g. which kind it counts). */
	[attribute: `data-${string}`]: string | undefined
}
