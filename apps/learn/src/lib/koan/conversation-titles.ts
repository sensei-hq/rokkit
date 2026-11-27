/** History labels for conversations. */
import type { ConversationSurface } from './conversations.svelte'

const TITLE_LEAD =
	/^(?:please|can you|could you|show me|show|give me|make(?: me)?|build(?: me)?|generate|create|draw|render|plot|display|i want(?: to see)?|i'?d like(?: to see)?|let'?s see)\b[\s,:-]*/i
const TITLE_ARTICLE = /^(?:a|an|the)\s+/i

/** Tidy a chat prompt into a short history label. */
export function summarizeTitle(query: string): string {
	let t = query.trim().replace(/\s+/g, ' ')
	let prev = ''
	while (t !== prev) {
		prev = t
		t = t.replace(TITLE_LEAD, '').trim()
	}
	t = t.replace(TITLE_ARTICLE, '').trim()
	if (t.length < 2) return 'New chat'
	if (t.length > 40) {
		const cut = t.slice(0, 40).replace(/\s+\S*$/, '').trim()
		t = `${cut || t.slice(0, 40).trim()  }…`
	}
	return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Chat titles are summarised prompts; app titles are the query as typed, capped. */
export function titleFor(surface: ConversationSurface, query: string): string {
	if (surface === 'chat') return summarizeTitle(query)
	return query.trim().slice(0, 80) || 'New conversation'
}
