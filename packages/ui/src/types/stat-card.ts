/**
 * StatCard Component Types
 */

/** The tone a number is read in; none is the plain ink. */
export type StatCardTone = 'danger' | 'warning' | 'success' | 'muted'

/** Props for the StatCard component. */
export interface StatCardProps {
	/** What the number counts. */
	label: string

	/** The number, or a value already written as text (e.g. `12 · 30`). */
	value: number | string

	/** An icon class (e.g. `i-glyph:table`) drawn before the label. */
	icon?: string

	/** The tone the value is read in. */
	tone?: StatCardTone

	/** Where the value leads, when something shows it. */
	href?: string

	/** Additional CSS class names. */
	class?: string

	/** Data attributes a host marks the card with (e.g. which kind it counts). */
	[attribute: `data-${string}`]: string | undefined
}
