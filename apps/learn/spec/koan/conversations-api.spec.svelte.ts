import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
	conversations,
	startNew,
	clearAll,
	getCurrentId,
	setCurrentId,
	getCurrentConversation,
	appendUser,
	appendTweak,
	appendAssistant,
	clearTweaksFor,
	updateLastAssistantProps,
	updateLastAssistantBlocks,
	loadConversation,
	mostRecent,
	removeConversation,
	renameConversation,
	bucketByRecency,
	recencyLabel,
	type Conversation
} from '../../src/lib/koan/conversations.svelte'

const STORAGE_KEY = 'rokkit-conversations'
const CURRENT_KEY = 'rokkit-current-conversation'

const current = () => getCurrentConversation()!
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Conversation[]

describe('conversations — turns on the current conversation', () => {
	beforeEach(() => clearAll())

	it('appends user, tweak and assistant turns, persisting each', () => {
		startNew('app', 'Tabs')
		appendUser('more')
		appendTweak('tabs', 'size', 'sm', 'lg')
		appendAssistant({ kind: 'markdown', text: 'ok' })
		expect(current().turns.map((t) => t.kind)).toEqual(['user', 'user', 'tweak', 'assistant'])
		expect(current().turns[2]).toMatchObject({ demoType: 'tabs', name: 'size', from: 'sm', to: 'lg' })
		expect(stored()[0].turns).toHaveLength(4)
	})

	it('does nothing without a current conversation, or when it no longer exists', () => {
		appendUser('x')
		appendTweak('tabs', 'a', 1, 2)
		appendAssistant({ kind: 'markdown', text: 'x' })
		clearTweaksFor('tabs')
		updateLastAssistantProps({})
		updateLastAssistantBlocks(() => [])
		expect(conversations).toHaveLength(0)

		setCurrentId('gone')
		appendUser('x')
		appendTweak('tabs', 'a', 1, 2)
		appendAssistant({ kind: 'markdown', text: 'x' })
		clearTweaksFor('tabs')
		updateLastAssistantProps({})
		updateLastAssistantBlocks(() => [])
		expect(conversations).toHaveLength(0)
	})

	it('clearTweaksFor drops only that demo’s tweaks, and is a no-op when there are none', () => {
		startNew('app', 'Tabs')
		appendTweak('tabs', 'size', 'sm', 'lg')
		appendTweak('list', 'size', 'sm', 'lg')
		const before = current().updatedAt
		clearTweaksFor('tree')
		expect(current().turns).toHaveLength(3)
		expect(current().updatedAt).toBe(before)
		clearTweaksFor('tabs')
		expect(current().turns.filter((t) => t.kind === 'tweak').map((t) => t.kind === 'tweak' && t.demoType)).toEqual([
			'list'
		])
	})

	it('updateLastAssistantProps rewrites the latest component turn only', () => {
		startNew('chat', 'form')
		appendAssistant({ kind: 'component', component: 'Form', props: { a: 1 } })
		appendAssistant({ kind: 'component', component: 'Form', props: { a: 2 } })
		appendAssistant({ kind: 'markdown', text: 'after' })
		updateLastAssistantProps({ a: 3 })
		const bodies = current().turns.flatMap((t) => (t.kind === 'assistant' ? [t.body] : []))
		expect(bodies[0]).toMatchObject({ props: { a: 1 } })
		expect(bodies[1]).toMatchObject({ props: { a: 3 } })
	})

	it('updateLastAssistantProps is a no-op when there is no component turn', () => {
		startNew('chat', 'x')
		appendAssistant({ kind: 'markdown', text: 'm' })
		updateLastAssistantProps({ a: 1 })
		expect(current().turns.at(-1)).toMatchObject({ body: { kind: 'markdown' } })
	})

	it('updateLastAssistantBlocks rewrites the latest blocks turn the updater accepts', () => {
		startNew('chat', 'x')
		appendAssistant({ kind: 'blocks', blocks: ['a'] })
		appendAssistant({ kind: 'blocks', blocks: ['b'] })
		appendAssistant({ kind: 'markdown', text: 'm' })
		updateLastAssistantBlocks((blocks) => (blocks[0] === 'a' ? ['A'] : null))
		const blocks = current().turns.flatMap((t) =>
			t.kind === 'assistant' && t.body.kind === 'blocks' ? [t.body.blocks] : []
		)
		expect(blocks).toEqual([['A'], ['b']])
		updateLastAssistantBlocks(() => null)
		expect(stored()[0].turns).toHaveLength(4)
	})
})

describe('conversations — selection and lifecycle', () => {
	beforeEach(() => clearAll())

	it('setCurrentId persists and clears the current id', () => {
		const id = startNew('app', 'Tabs')
		expect(localStorage.getItem(CURRENT_KEY)).toBe(id)
		setCurrentId(null)
		expect(getCurrentId()).toBeNull()
		expect(getCurrentConversation()).toBeNull()
		expect(localStorage.getItem(CURRENT_KEY)).toBeNull()
	})

	it('loadConversation resumes a conversation and returns null for an unknown id', () => {
		const a = startNew('app', 'Tabs')
		startNew('app', 'Table')
		expect(loadConversation(a)?.id).toBe(a)
		expect(getCurrentId()).toBe(a)
		expect(loadConversation('nope')).toBeNull()
	})

	it('mostRecent picks the latest-updated conversation, optionally per surface', () => {
		expect(mostRecent()).toBeNull()
		const app = startNew('app', 'Tabs')
		const chat = startNew('chat', 'chart')
		conversations.find((c) => c.id === app)!.updatedAt = new Date(Date.now() + 1000).toISOString()
		expect(mostRecent()?.id).toBe(app)
		expect(mostRecent('chat')?.id).toBe(chat)
	})

	it('removeConversation drops a row and clears current only when it was current', () => {
		const a = startNew('app', 'Tabs')
		const b = startNew('app', 'Table')
		removeConversation(a)
		expect(getCurrentId()).toBe(b)
		removeConversation(b)
		expect(getCurrentId()).toBeNull()
		removeConversation('nope')
		expect(conversations).toHaveLength(0)
	})

	it('renameConversation ignores an unknown id', () => {
		startNew('app', 'Tabs')
		renameConversation('nope', 'X')
		expect(conversations[0].title).toBe('Tabs')
	})

	it('app titles are trimmed, capped at 80 and fall back for blank input', () => {
		startNew('app', `  ${'x'.repeat(100)}  `)
		expect(conversations[0].title).toHaveLength(80)
		startNew('app', '   ')
		expect(conversations[0].title).toBe('New conversation')
	})

	it('keeps at most 20 conversations, pruning the oldest', () => {
		for (let i = 0; i < 22; i++) startNew('chat', `prompt ${i}`)
		expect(conversations).toHaveLength(20)
	})
})

describe('conversations — recency', () => {
	afterEach(() => vi.useRealTimers())
	beforeEach(() => clearAll())

	const at = (msAgo: number) =>
		({ updatedAt: new Date(Date.now() - msAgo).toISOString() }) as Conversation
	const MIN = 60_000
	const HOUR = 60 * MIN
	const DAY = 24 * HOUR

	it('labels minutes, hours, yesterday, weekday and date', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-11-26T12:00:00'))
		expect(recencyLabel(at(0))).toBe('1m')
		expect(recencyLabel(at(12 * MIN))).toBe('12m')
		expect(recencyLabel(at(2 * HOUR))).toBe('2h')
		expect(recencyLabel(at(DAY))).toBe('yest')
		expect(recencyLabel(at(3 * DAY))).toBe('Mon')
		expect(recencyLabel(at(30 * DAY))).toMatch(/Oct\s*27|27\s*Oct/)
	})

	it('buckets into today, yesterday and earlier', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-11-26T12:00:00'))
		const ids = ['t', 'y', 'e'].map((q) => startNew('app', q))
		const ago = [HOUR, DAY, 5 * DAY]
		ids.forEach((id, i) => {
			conversations.find((c) => c.id === id)!.updatedAt = new Date(Date.now() - ago[i]).toISOString()
		})
		const b = bucketByRecency()
		expect([b.today, b.yesterday, b.earlier].map((g) => g.map((c) => c.title))).toEqual([['t'], ['y'], ['e']])
		expect(bucketByRecency('chat').today).toEqual([])
	})
})

describe('conversations — restored from storage', () => {
	afterEach(() => {
		localStorage.clear()
		vi.resetModules()
	})

	const fresh = () => import('../../src/lib/koan/conversations.svelte')
	const valid = { id: 'c1', title: 'T', surface: 'app', createdAt: 'x', updatedAt: 'x', turns: [] }

	it('loads valid conversations, drops malformed ones and restores the current id', async () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([valid, { id: 2 }, null]))
		localStorage.setItem(CURRENT_KEY, 'c1')
		vi.resetModules()
		const m = await fresh()
		expect(m.conversations.map((c) => c.id)).toEqual(['c1'])
		expect(m.getCurrentId()).toBe('c1')
	})

	it('ignores an orphaned current id, non-array data and unparsable data', async () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }))
		localStorage.setItem(CURRENT_KEY, 'ghost')
		vi.resetModules()
		let m = await fresh()
		expect(m.conversations).toEqual([])
		expect(m.getCurrentId()).toBeNull()

		localStorage.setItem(STORAGE_KEY, '{oops')
		vi.resetModules()
		m = await fresh()
		expect(m.conversations).toEqual([])
	})

	it('warns, rather than throws, when storage is full', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
			throw new Error('quota')
		})
		expect(() => startNew('app', 'Tabs')).not.toThrow()
		expect(warn).toHaveBeenCalled()
		setItem.mockRestore()
		warn.mockRestore()
	})
})
