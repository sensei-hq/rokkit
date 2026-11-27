/**
 * localStorage persistence for the conversations store. Every access is guarded: no
 * storage (SSR), quota and private-mode failures must never break the chat.
 */
import type { Conversation, ConversationId } from './conversations.svelte'

const STORAGE_KEY = 'rokkit-conversations'
const CURRENT_KEY = 'rokkit-current-conversation'

const store = (): Storage | null => (typeof localStorage === 'undefined' ? null : localStorage)

export function loadConversations(): Conversation[] {
	try {
		const raw = store()?.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		if (!Array.isArray(parsed)) return []
		return parsed.filter(isValidConversation)
	} catch {
		return []
	}
}

/**
 * The persisted shape, field by field. A table rather than one long `&&` chain so
 * adding a required field is an entry, and a rejected record can be traced to the
 * field that failed.
 */
const CONVERSATION_SHAPE: Array<[string, (v: unknown) => boolean]> = [
	['id', (v) => typeof v === 'string'],
	['title', (v) => typeof v === 'string'],
	['surface', (v) => v === 'app' || v === 'chat'],
	['createdAt', (v) => typeof v === 'string'],
	['updatedAt', (v) => typeof v === 'string'],
	['turns', Array.isArray]
]

function isValidConversation(c: unknown): c is Conversation {
	if (!c || typeof c !== 'object') return false
	const o = c as Record<string, unknown>
	return CONVERSATION_SHAPE.every(([key, isValid]) => isValid(o[key]))
}

export function loadCurrentId(): ConversationId | null {
	try {
		return store()?.getItem(CURRENT_KEY) ?? null
	} catch {
		return null
	}
}

export function saveConversations(list: Conversation[]): void {
	try {
		store()?.setItem(STORAGE_KEY, JSON.stringify(list))
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn('Failed to persist conversations', e)
	}
}

export function saveCurrentId(id: ConversationId | null): void {
	try {
		if (id) store()?.setItem(CURRENT_KEY, id)
		else store()?.removeItem(CURRENT_KEY)
	} catch {
		// Quota / private-mode failures — current-id is a UX nicety, not load-bearing.
	}
}
