/**
 * Timeline Component Types
 *
 * View-only vertical steps for instructions, changelogs,
 * or process visualization. No interaction.
 */

import type { Snippet } from 'svelte'
import type { PillTone } from './pill.js'
// =============================================================================
// Field Mapping Types
// =============================================================================

export interface TimelineFields {
	label?: string
	icon?: string
	subtext?: string
	/** The field holding the item's tone: its node is ringed in that colour. */
	tone?: string
}

export const defaultTimelineFields: Required<TimelineFields> = {
	label: 'label',
	icon: 'icon',
	subtext: 'description',
	tone: 'tone'
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface TimelineIcons {
	/** Icon class for completed state (default: i-lucide:check) */
	completed?: string
}

export const defaultTimelineIcons: Required<TimelineIcons> = {
	completed: 'i-lucide:check'
}

/** An item's tone: the colour its node is read in (the same set as a status Pill). */
export type TimelineTone = PillTone

export interface TimelineProps {
	/** Array of timeline items */
	items?: Record<string, unknown>[]

	/** Field mapping configuration */
	fields?: TimelineFields

	/** Custom icons */
	icons?: TimelineIcons

	/** `dot`: each item is a small plain dot on one continuous line (a history or a
	 *  log), not a numbered step. */
	marker?: 'dot'

	/** Additional CSS class */
	class?: string

	/** Custom content snippet for each item: (item, index) */
	content?: Snippet<[Record<string, unknown>, number]>
}
