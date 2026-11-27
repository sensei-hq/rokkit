/* The chat store's pure pieces: how a stored turn reads back as a chat turn, how the user turn
 * summarises a paste or an export, and the canned replies the store answers with. No state —
 * the store owns that; these only shape values.
 */
import type { Turn } from '#lib/koan/conversations.svelte.ts'
import type { LLMProvider } from './llm.svelte'
import type { Block, ChatTurn } from './types'

export function toChatTurn(t: Turn): ChatTurn {
	const timestamp = Date.parse(t.at)
	if (t.kind === 'user') {
		return { id: t.id, timestamp, role: 'user', text: t.text }
	}
	// `tweak` turns are canvas-scoped and never carry chat content; render them
	// as an empty assistant turn. Only `assistant` turns have a `body`.
	if (t.kind !== 'assistant') {
		return { id: t.id, timestamp, role: 'assistant', blocks: [] }
	}
	const blocks = t.body.kind === 'blocks' ? (t.body.blocks as Block[]) : []
	const provider = t.body.kind === 'blocks' ? t.body.provider : undefined
	const model = t.body.kind === 'blocks' ? t.body.model : undefined
	return { id: t.id, timestamp, role: 'assistant', blocks, provider, model }
}

/** "12 rows" / "4 fields" / "value" — how the user turn summarises what changed. */
export function describeShape(data: unknown): string {
	if (Array.isArray(data)) return `${data.length} rows`
	if (typeof data === 'object' && data !== null) {
		return `${Object.keys(data as Record<string, unknown>).length} fields`
	}
	return 'value'
}

/** Prose + the edited JSON + a "render it again" chip, so the round-trip continues. */
export function exportBlocks(data: unknown): Block[] {
	return [
		{
			kind: 'prose',
			text: "Here's the updated value — copy or paste it back to keep the round-trip going."
		},
		{
			kind: 'code',
			language: 'json',
			filename: 'edited.json',
			code: JSON.stringify(data, null, 2)
		},
		{
			kind: 'suggestions',
			intro: 'Or',
			items: [{ label: 'Render again', query: JSON.stringify(data) }]
		}
	]
}

/** What switching to a provider means for the user. */
export function switchedProviderBlocks(provider: LLMProvider): Block[] {
	return [
		{
			kind: 'prose',
			text:
				provider === 'webllm'
					? 'Switched to Web-LLM. Click "Load model" in the chrome — first-time download is ~1–2 GB and runs entirely in the browser after.'
					: 'Switched to OpenRouter.'
		}
	]
}

/** The user turn for a paste: the query, then what was pasted — rows, a record, or a preview. */
export function summariseUpload(source: 'json' | 'csv', text: string, parsed: unknown, query?: string): string {
	const head = query?.trim() ? `${query.trim()} — ` : ''
	if (Array.isArray(parsed)) {
		return `${head}pasted ${source.toUpperCase()} · ${parsed.length} rows`
	}
	if (typeof parsed === 'object' && parsed !== null) {
		const keys = Object.keys(parsed as Record<string, unknown>)
		return `${head}pasted ${source.toUpperCase()} · 1 record · ${keys.length} fields`
	}
	const preview = text.length > 80 ? `${text.slice(0, 80)}…` : text
	return `${head}pasted ${source.toUpperCase()}: ${preview}`
}
