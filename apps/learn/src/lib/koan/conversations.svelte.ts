/**
 * Shared conversation history for the /app and /chat surfaces.
 *
 * Each Conversation is a record of "what the user asked + what Rokkit
 * showed." The sidebar reads {title, surface, updatedAt} for the row,
 * the active route reads turns[] for rendering. Persisted to
 * localStorage (cap 20, oldest pruned on append) so the sidebar
 * survives reloads.
 */

import type { ShellDemoType } from './shell.svelte'
import { loadConversations, loadCurrentId, saveConversations, saveCurrentId } from './conversation-storage'
import { titleFor } from './conversation-titles'
import { bucketConversations, type ConversationBuckets } from './conversation-recency'

export { summarizeTitle } from './conversation-titles'
export { recencyLabel, type ConversationBuckets } from './conversation-recency'

const MAX_CONVERSATIONS = 20

export type ConversationId = string
export type ConversationSurface = 'app' | 'chat'

export interface UserTurn {
	kind: 'user'
	id: string
	at: string
	text: string
}

/**
 * A live prop tweak the user applied to the canvas component. Persisted
 * with the conversation so the canvas restores to the same values on
 * reload + resume — replayed by the layout on mount into the in-memory
 * `tweaksByDemo` map. No longer surfaced as a chat-stream row (felt
 * noisy when clicking through enum values); the canvas's own tweak
 * strip shows the live count instead. `demoType` scopes rows to the
 * currently mounted demo when one conversation spans multiple demos.
 */
export interface TweakTurn {
	kind: 'tweak'
	id: string
	at: string
	demoType: string
	name: string
	from: unknown
	to: unknown
}

export type ChatProvider = 'scripted' | 'openrouter' | 'webllm'

export type AssistantBody =
	| { kind: 'demo'; demoType: ShellDemoType; variant: string | null }
	| {
			kind: 'blocks'
			blocks: unknown[]
			provider?: ChatProvider
			model?: string
	  }
	| { kind: 'markdown'; text: string }
	| { kind: 'component'; component: string; props: unknown }
	| { kind: 'error'; message: string }

export interface AssistantTurn {
	kind: 'assistant'
	id: string
	at: string
	body: AssistantBody
}

export type Turn = UserTurn | AssistantTurn | TweakTurn

export interface Conversation {
	id: ConversationId
	title: string
	surface: ConversationSurface
	mode?: string
	createdAt: string
	updatedAt: string
	turns: Turn[]
}

// ── State ────────────────────────────────────────────────────────────────

export const conversations = $state<Conversation[]>(loadConversations())
// Restore the previously-active conversation id only if it still
// exists in storage — protects against an orphaned id pointing at a
// conversation that was pruned or cleared.
const initialCurrent = (() => {
	const stored = loadCurrentId()
	if (stored && conversations.some((c) => c.id === stored)) return stored
	return null
})()
const currentRef = $state<{ id: ConversationId | null }>({ id: initialCurrent })

export function getCurrentId(): ConversationId | null {
	return currentRef.id
}

export function setCurrentId(id: ConversationId | null): void {
	currentRef.id = id
	persistCurrentId()
}

/** Returns the active conversation by current id, or null. */
export function getCurrentConversation(): Conversation | null {
	if (!currentRef.id) return null
	return conversations.find((c) => c.id === currentRef.id) ?? null
}

// ── Persistence ──────────────────────────────────────────────────────────

function persist(): void {
	saveConversations(conversations)
}

function persistCurrentId(): void {
	saveCurrentId(currentRef.id)
}

// ── Helpers ──────────────────────────────────────────────────────────────

function nowIso(): string {
	return new Date().toISOString()
}

function makeId(prefix: string): string {
	const r = Math.random().toString(36).slice(2, 8)
	return `${prefix}_${Date.now()}_${r}`
}

function pruneOldest(): void {
	if (conversations.length <= MAX_CONVERSATIONS) return
	// Sort by updatedAt asc, drop the oldest.
	const sorted = [...conversations].sort(
		(a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
	)
	const toRemove = sorted.slice(0, conversations.length - MAX_CONVERSATIONS)
	for (const stale of toRemove) {
		const idx = conversations.findIndex((c) => c.id === stale.id)
		if (idx >= 0) conversations.splice(idx, 1)
	}
}

function findIndexById(id: ConversationId): number {
	return conversations.findIndex((c) => c.id === id)
}

function touch(id: ConversationId): void {
	const idx = findIndexById(id)
	if (idx >= 0) conversations[idx].updatedAt = nowIso()
}

/**
 * Run `edit` on the current conversation when there is one. `edit` returns whether it
 * changed anything; a change stamps `updatedAt` and persists.
 */
function editCurrent(edit: (conv: Conversation) => boolean, at = nowIso()): void {
	const conv = getCurrentConversation()
	if (!conv || !edit(conv)) return
	conv.updatedAt = at
	persist()
}

function pushTurn(turn: Turn): void {
	editCurrent((conv) => conv.turns.push(turn) > 0, turn.at)
}

/** Rewrite the newest assistant turn of `kind` that `rewrite` accepts (returns non-null for). */
function rewriteLastAssistant<K extends AssistantBody['kind']>(
	kind: K,
	rewrite: (body: Extract<AssistantBody, { kind: K }>) => AssistantBody | null
): void {
	editCurrent((conv) => {
		for (let i = conv.turns.length - 1; i >= 0; i--) {
			const t = conv.turns[i]
			if (t.kind !== 'assistant' || t.body.kind !== kind) continue
			const next = rewrite(t.body as Extract<AssistantBody, { kind: K }>)
			if (!next) continue
			t.body = next
			return true
		}
		return false
	})
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Start a new conversation, set it as current, and append the user's
 * initial query. Returns the conversation id — the existing row's id
 * when an `app` title matched, otherwise a new one.
 */
/**
 * Upsert by title for the `app` surface: re-exploring the same component reuses
 * its existing row (turns reset, moved to top) instead of stacking
 * duplicate-titled entries. Returns the reused id, or null when there was
 * nothing to reuse and the caller should create a fresh conversation.
 */
function reuseAppConversation(
	title: string,
	at: string,
	userTurn: UserTurn
): ConversationId | null {
	const idx = conversations.findIndex((c) => c.surface === 'app' && c.title === title)
	if (idx < 0) return null
	const [existing] = conversations.splice(idx, 1)
	existing.updatedAt = at
	existing.turns = [userTurn]
	conversations.unshift(existing)
	currentRef.id = existing.id
	persist()
	persistCurrentId()
	return existing.id
}

export function startNew(surface: ConversationSurface, query: string, mode?: string): ConversationId {
	const at = nowIso()
	const title = titleFor(surface, query)
	const userTurn: UserTurn = { kind: 'user', id: makeId('t'), at, text: query }

	// The `chat` surface always appends; `app` upserts by title.
	if (surface === 'app') {
		const reused = reuseAppConversation(title, at, userTurn)
		if (reused) return reused
	}

	const id = makeId('conv')
	const conv: Conversation = {
		id,
		title,
		surface,
		mode: surface === 'chat' ? mode : undefined,
		createdAt: at,
		updatedAt: at,
		turns: [userTurn]
	}
	conversations.unshift(conv)
	pruneOldest()
	currentRef.id = id
	persist()
	persistCurrentId()
	return id
}

/** Append a user turn to the current conversation. */
export function appendUser(text: string): void {
	pushTurn({ kind: 'user', id: makeId('t'), at: nowIso(), text })
}

/** Append a tweak turn (live prop edit) to the current conversation. */
export function appendTweak(
	demoType: string,
	name: string,
	from: unknown,
	to: unknown
): void {
	pushTurn({ kind: 'tweak', id: makeId('t'), at: nowIso(), demoType, name, from, to })
}

/**
 * Drop all tweak turns for a given demoType from the current
 * conversation — backs the Tweaks slab's "Reset to defaults" button.
 */
export function clearTweaksFor(demoType: string): void {
	editCurrent((conv) => {
		const kept = conv.turns.filter((t) => !(t.kind === 'tweak' && t.demoType === demoType))
		if (kept.length === conv.turns.length) return false
		conv.turns = kept
		return true
	})
}

/** Append an assistant turn to the current conversation. */
export function appendAssistant(body: AssistantBody): void {
	const turn: AssistantTurn = { kind: 'assistant', id: makeId('t'), at: nowIso(), body }
	pushTurn(turn)
}

/**
 * Update the last assistant turn's component props in place — used by
 * /chat editable artifacts so edits persist without flooding the
 * history with one turn per keystroke.
 */
export function updateLastAssistantProps(props: unknown): void {
	rewriteLastAssistant('component', (body) => ({ ...body, props }))
}

/**
 * Rewrite the blocks of the latest assistant turn that `update` accepts — it returns the new
 * blocks, or null to look further back. In place, like `updateLastAssistantProps`: a live
 * adjustment to what is on screen is saved without adding a turn.
 */
export function updateLastAssistantBlocks(update: (blocks: unknown[]) => unknown[] | null): void {
	rewriteLastAssistant('blocks', (body) => {
		const next = update(body.blocks)
		return next ? { ...body, blocks: next } : null
	})
}

/** Resume an existing conversation by id. */
export function loadConversation(id: ConversationId): Conversation | null {
	const conv = conversations.find((c) => c.id === id)
	if (!conv) return null
	currentRef.id = id
	touch(id)
	persist()
	persistCurrentId()
	return conv
}

/** Returns the most-recent conversation for a surface, or null. */
export function mostRecent(surface?: ConversationSurface): Conversation | null {
	const pool = surface ? conversations.filter((c) => c.surface === surface) : conversations
	if (pool.length === 0) return null
	return [...pool].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0]
}

/** Delete a conversation. */
export function removeConversation(id: ConversationId): void {
	const idx = findIndexById(id)
	if (idx < 0) return
	conversations.splice(idx, 1)
	if (currentRef.id === id) {
		currentRef.id = null
		persistCurrentId()
	}
	persist()
}

/** Rename a conversation (used to refine a chat title after the first render). */
export function renameConversation(id: ConversationId, title: string): void {
	if (!title.trim()) return
	const idx = findIndexById(id)
	if (idx >= 0) {
		conversations[idx].title = title
		persist()
	}
}

/** Drop everything. */
export function clearAll(): void {
	conversations.splice(0, conversations.length)
	currentRef.id = null
	persist()
	persistCurrentId()
}

// ── Bucketing (today / yesterday / earlier) ──────────────────────────────

export function bucketByRecency(surface?: ConversationSurface, mode?: string): ConversationBuckets {
	return bucketConversations(conversations, surface, mode)
}
