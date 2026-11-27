/** Recency grouping and labels for the conversation history rail. */
import { SvelteDate } from 'svelte/reactivity'
import type { Conversation, ConversationSurface } from './conversations.svelte'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface ConversationBuckets {
	today: Conversation[]
	yesterday: Conversation[]
	earlier: Conversation[]
}

function startOfDay(d: Date): number {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** No surface / mode means any. */
function inScope(c: Conversation, surface?: ConversationSurface, mode?: string): boolean {
	return (!surface || c.surface === surface) && (!mode || c.mode === mode)
}

export function bucketConversations(
	conversations: Conversation[],
	surface?: ConversationSurface,
	mode?: string
): ConversationBuckets {
	const pool = conversations.filter((c) => inScope(c, surface, mode))
	const sorted = [...pool].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
	// A plain Date: `SvelteDate` adds no reactivity in a one-shot read, and it subclasses
	// the Date captured at import, so it ignores a faked clock.
	const todayStart = startOfDay(new Date())
	const yesterdayStart = todayStart - DAY

	const buckets: ConversationBuckets = { today: [], yesterday: [], earlier: [] }
	for (const c of sorted) {
		const t = Date.parse(c.updatedAt)
		if (t >= todayStart) buckets.today.push(c)
		else if (t >= yesterdayStart) buckets.yesterday.push(c)
		else buckets.earlier.push(c)
	}
	return buckets
}

/** Relative "12m / 2h / yest / Mon / Sun" label for a conversation. */
export function recencyLabel(c: Conversation): string {
	const t = Date.parse(c.updatedAt)
	const diffMs = Date.now() - t
	if (diffMs < HOUR) return `${Math.max(1, Math.floor(diffMs / MINUTE))}m`
	if (diffMs < DAY) return `${Math.floor(diffMs / HOUR)}h`
	const days = Math.floor(diffMs / DAY)
	if (days === 1) return 'yest'
	const date = new SvelteDate(t)
	return days < 7
		? WEEKDAYS[date.getDay()]
		: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
