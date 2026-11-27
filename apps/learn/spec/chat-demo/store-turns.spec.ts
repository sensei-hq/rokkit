/* Characterization: what the chat store writes for the paths the conversation specs do not
 * walk — pasted-data summaries, the edit/export round-trip, switching provider from a chip,
 * reading turns back, and restoring the provider a resumed conversation was answered by.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { appendAssistant, appendUser, clearAll, startNew } from '../../src/lib/koan/conversations.svelte'
import {
	conversation,
	resetConversation,
	submitAction,
	submitData,
	submitExport,
	syncLLMFromCurrentConversation
} from '../../src/lib/chat-demo/store.svelte'
import { DEFAULT_OPENROUTER_MODEL, llm } from '../../src/lib/chat-demo/llm.svelte'

const userTexts = () => conversation.turns.flatMap((t) => (t.role === 'user' ? [t.text] : []))
const lastBlocks = () => {
	const turn = conversation.turns.at(-1)
	return turn?.role === 'assistant' ? turn.blocks : []
}

beforeEach(() => {
	vi.useFakeTimers()
	clearAll()
	resetConversation()
	llm.enabled = false
	llm.provider = 'openrouter'
	llm.interpreter = 'local'
	llm.openRouterModel = DEFAULT_OPENROUTER_MODEL
})
afterEach(() => vi.useRealTimers())

describe('pasted data — the user turn summarises it', () => {
	it('counts rows for an array, with the query ahead of it', () => {
		submitData({ source: 'csv', text: 'a,b\n1,2', parsed: [{ a: 1 }, { a: 2 }], query: '  chart it ' })
		expect(userTexts()).toEqual(['chart it — pasted CSV · 2 rows'])
	})

	it('counts fields for a single record', () => {
		submitData({ source: 'json', text: '{"a":1,"b":2}', parsed: { a: 1, b: 2 } })
		expect(userTexts()).toEqual(['pasted JSON · 1 record · 2 fields'])
	})

	it('previews the text of anything else, cut at 80 characters', () => {
		submitData({ source: 'json', text: '42', parsed: 42 })
		submitData({ source: 'json', text: 'x'.repeat(90), parsed: 'x' })
		expect(userTexts()).toEqual(['pasted JSON: 42', `pasted JSON: ${'x'.repeat(80)}…`])
	})
})

describe('export — the edited value comes back as JSON', () => {
	it('summarises rows, fields or a value in the user turn', () => {
		submitExport({ source: 'table', data: [1, 2, 3] })
		submitExport({ source: 'form', data: { a: 1 }, caption: 'Profile' })
		submitExport({ source: 'range', data: 7 })
		expect(userTexts()).toEqual([
			'Saved changes to "table" · 3 rows',
			'Saved changes to "Profile" · 1 fields',
			'Saved changes to "range" · value'
		])
	})

	it('replies with prose, the JSON and a chip to render it again — after thinking', () => {
		submitExport({ source: 'form', data: { a: 1 } })
		expect(conversation.thinking).toBe(true)
		vi.runAllTimers()
		expect(conversation.thinking).toBe(false)
		expect(lastBlocks()).toEqual([
			{ kind: 'prose', text: "Here's the updated value — copy or paste it back to keep the round-trip going." },
			{ kind: 'code', language: 'json', filename: 'edited.json', code: '{\n  "a": 1\n}' },
			{ kind: 'suggestions', intro: 'Or', items: [{ label: 'Render again', query: '{"a":1}' }] }
		])
	})
})

describe('a switch-provider chip', () => {
	it('switches to Web-LLM and says what loading it costs', () => {
		submitAction({ label: 'Use Web-LLM', action: { kind: 'switch-provider', provider: 'webllm' } })
		vi.runAllTimers()
		expect(llm.provider).toBe('webllm')
		expect(userTexts()).toEqual(['Use Web-LLM'])
		expect(lastBlocks()).toEqual([
			{
				kind: 'prose',
				text: 'Switched to Web-LLM. Click "Load model" in the chrome — first-time download is ~1–2 GB and runs entirely in the browser after.'
			}
		])
	})

	it('switches to OpenRouter, and an unlabelled chip reads as "Suggestion"', () => {
		llm.provider = 'webllm'
		submitAction({ action: { kind: 'switch-provider', provider: 'openrouter' } })
		vi.runAllTimers()
		expect(llm.provider).toBe('openrouter')
		expect(userTexts()).toEqual(['Suggestion'])
		expect(lastBlocks()).toEqual([{ kind: 'prose', text: 'Switched to OpenRouter.' }])
	})
})

describe('turns read back from the shared store', () => {
	it('carries the provider and model of an assistant turn', () => {
		startNew('chat', 'hello')
		appendAssistant({ kind: 'blocks', blocks: [{ kind: 'prose', text: 'hi' }], provider: 'webllm', model: 'm1' })
		const turn = conversation.turns.at(-1)
		expect(turn).toMatchObject({ role: 'assistant', blocks: [{ kind: 'prose', text: 'hi' }], provider: 'webllm', model: 'm1' })
		expect(typeof turn?.timestamp).toBe('number')
	})

	it('reads a non-blocks assistant body as an empty reply', () => {
		startNew('chat', 'hello')
		appendAssistant({ kind: 'markdown', text: 'ignored' })
		expect(conversation.turns.at(-1)).toMatchObject({ role: 'assistant', blocks: [] })
		expect(conversation.turns.at(-1)).not.toHaveProperty('provider', expect.anything())
	})

	it('is empty for a conversation from another surface', () => {
		startNew('app', 'hello')
		expect(conversation.turns).toEqual([])
	})

	it('lets the thinking flag be set from outside', () => {
		conversation.thinking = true
		expect(conversation.thinking).toBe(true)
		conversation.thinking = false
		expect(conversation.thinking).toBe(false)
	})
})

describe('resuming restores the provider the conversation was answered by', () => {
	const answeredBy = (body: { provider?: 'scripted' | 'openrouter' | 'webllm'; model?: string }) => {
		startNew('chat', 'hello')
		appendAssistant({ kind: 'blocks', blocks: [], ...body })
		appendUser('and then')
	}

	it('turns the LLM on for an OpenRouter answer, keeping only a curated model', () => {
		answeredBy({ provider: 'openrouter', model: 'not/a-curated-model' })
		syncLLMFromCurrentConversation()
		expect(llm).toMatchObject({ enabled: true, provider: 'openrouter', openRouterModel: DEFAULT_OPENROUTER_MODEL })
	})

	it('restores the Web-LLM model as recorded', () => {
		answeredBy({ provider: 'webllm', model: 'some-webllm-model' })
		syncLLMFromCurrentConversation()
		expect(llm).toMatchObject({ enabled: true, provider: 'webllm', webllmModel: 'some-webllm-model' })
	})

	it('keeps the current model when the turn recorded none', () => {
		llm.openRouterModel = 'kept'
		answeredBy({ provider: 'openrouter' })
		syncLLMFromCurrentConversation()
		expect(llm).toMatchObject({ enabled: true, provider: 'openrouter', openRouterModel: 'kept' })
	})

	it('turns the LLM off for a scripted answer', () => {
		llm.enabled = true
		answeredBy({ provider: 'scripted' })
		syncLLMFromCurrentConversation()
		expect(llm.enabled).toBe(false)
	})

	it('leaves the toggle alone when no turn recorded a provider, or the conversation is not a chat', () => {
		llm.enabled = true
		answeredBy({})
		syncLLMFromCurrentConversation()
		expect(llm.enabled).toBe(true)
		startNew('app', 'elsewhere')
		syncLLMFromCurrentConversation()
		expect(llm.enabled).toBe(true)
	})

	it('the latest answer that recorded a provider wins', () => {
		startNew('chat', 'hello')
		appendAssistant({ kind: 'blocks', blocks: [], provider: 'webllm', model: 'w' })
		appendAssistant({ kind: 'blocks', blocks: [], provider: 'openrouter' })
		appendAssistant({ kind: 'blocks', blocks: [] })
		syncLLMFromCurrentConversation()
		expect(llm).toMatchObject({ enabled: true, provider: 'openrouter' })
	})
})
