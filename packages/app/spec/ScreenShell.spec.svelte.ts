import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import ScreenShellTest from './ScreenShellTest.svelte'
import type { ShellStat, InfoColumn } from '../src/types/screen-shell.js'

const q = (root: ParentNode, sel: string) => root.querySelector(sel) as HTMLElement | null
const qa = (root: ParentNode, sel: string) => [...root.querySelectorAll(sel)] as HTMLElement[]
const json = (root: ParentNode, sel: string) => JSON.parse(q(root, sel)?.textContent ?? 'null')

const base = { mark: { kanji: '結', icon: 'i-sync' }, title: 'Dōjō sync' }

const info: InfoColumn[] = [
	{
		label: 'Use it to',
		kanji: '稽',
		title: 'See what reaches your dōjō',
		text: 'Every repository.'
	},
	{
		label: 'How to read it',
		steps: [
			{ kanji: '場', title: 'Pick a project', text: 'Any of them.' },
			{ kanji: '観', title: 'Just work' }
		]
	},
	{ label: 'Sessions watched', value: 1, total: 3, progress: 1 / 3, text: 'Around the third.' }
]

const stats: ShellStat[] = [
	{
		id: 'you',
		title: 'Needs you',
		kanji: '手',
		value: 1,
		description: 'Only you can turn it on',
		filter: { key: 'who', value: 'you' }
	},
	{
		id: 'failing',
		title: 'Failing',
		kanji: '難',
		value: 2,
		tone: 'danger',
		filter: { key: 'who', value: 'failing' }
	},
	{ id: 'dojos', title: 'Dōjōs', kanji: '場', value: 3 },
	{ id: 'repos', title: 'Repos', kanji: '庫', value: 4, href: '/repos' }
]

const toggles = (root: ParentNode) =>
	qa(root, '[data-screen-tools] [data-toolbar-item][aria-pressed]').map((b) => ({
		label: b.getAttribute('aria-label'),
		pressed: b.getAttribute('aria-pressed')
	}))
const toggle = (root: ParentNode, label: string) =>
	q(root, `[data-screen-tools] [data-toolbar-item][aria-label="${label}"]`) as HTMLButtonElement
const card = (root: ParentNode, title: string) =>
	qa(root, '[data-stat-card]').find(
		(c) => c.querySelector('[data-stat-card-label]')?.textContent === title
	)!

afterEach(() => vi.restoreAllMocks())

describe('ScreenShell — title bar', () => {
	it('draws the mark, title, context and description', () => {
		const { container } = render(ScreenShellTest, {
			props: { ...base, context: '@jerrythomas', description: 'Is my work reaching my dōjō?' }
		})

		expect(q(container, '[data-screen-mark]')?.textContent).toBe('結')
		expect(q(container, '[data-screen-title]')?.textContent).toBe('Dōjō sync')
		expect(q(container, '[data-screen-title]')?.tagName).toBe('H1')
		expect(q(container, '[data-screen-context]')?.textContent).toBe('@jerrythomas')
		expect(q(container, '[data-screen-description]')?.textContent).toBe(
			'Is my work reaching my dōjō?'
		)
	})

	it('draws the icon instead of the kanji in icon mode, the kanji when there is no icon', () => {
		const iconMode = render(ScreenShellTest, { props: { ...base, glyphs: 'icon' } })
		const mark = q(iconMode.container, '[data-screen-mark]')!
		expect(mark.classList.contains('i-sync')).toBe(true)
		expect(mark.textContent).toBe('')

		const noIcon = render(ScreenShellTest, {
			props: { mark: { kanji: '調' }, title: 'General', glyphs: 'icon' }
		})
		expect(q(noIcon.container, '[data-screen-mark]')?.textContent).toBe('調')
	})

	it('is valid with only a mark, a title and a body: no bands, no toggles, no footer', () => {
		const { container } = render(ScreenShellTest, { props: { ...base, search: false } })

		expect(q(container, '[data-test-body]')?.textContent).toBe('Body')
		for (const part of ['info', 'stats', 'filters', 'sidebar', 'footer', 'description', 'search'])
			expect(q(container, `[data-screen-${part}]`), part).toBeNull()
		expect(toggles(container)).toEqual([])
	})
})

describe('ScreenShell — toolbar and panels', () => {
	it('shows a toggle per band the view has, in order, all pressed on a first visit', () => {
		const { container } = render(ScreenShellTest, {
			props: { ...base, info, stats, withSidebar: true, withFilterSnippet: true }
		})

		expect(toggles(container)).toEqual([
			{ label: 'What it’s for', pressed: 'true' },
			{ label: 'Numbers', pressed: 'true' },
			{ label: 'Filters', pressed: 'true' },
			{ label: 'Side panel', pressed: 'true' }
		])
		for (const part of ['info', 'stats', 'filters', 'sidebar'])
			expect(q(container, `[data-screen-${part}]`), part).not.toBeNull()
	})

	it('never shows a toggle for a band the view does not pass', () => {
		const { container } = render(ScreenShellTest, { props: { ...base, info } })

		expect(toggles(container).map((t) => t.label)).toEqual(['What it’s for'])
	})

	it('a toggle closes its band and writes the whole panel state, bound and emitted', async () => {
		const onpanels = vi.fn()
		const { container } = render(ScreenShellTest, {
			props: { ...base, info, stats, withSidebar: true, onpanels }
		})

		await fireEvent.click(toggle(container, 'What it’s for'))

		expect(q(container, '[data-screen-info]')).toBeNull()
		expect(toggle(container, 'What it’s for').getAttribute('aria-pressed')).toBe('false')
		expect(onpanels).toHaveBeenCalledWith({ info: false, stats: true, side: true })
		expect(json(container, '[data-test-panels]')).toEqual({ info: false, stats: true, side: true })

		await fireEvent.click(toggle(container, 'Side panel'))
		expect(q(container, '[data-screen-sidebar]')).toBeNull()
		expect(json(container, '[data-test-panels]')).toEqual({ info: false, stats: true, side: false })
	})

	it('opens as the panels it is given say, a missing key open', () => {
		const { container } = render(ScreenShellTest, {
			props: { ...base, info, stats, panels: { stats: false } }
		})

		expect(q(container, '[data-screen-stats]')).toBeNull()
		expect(q(container, '[data-screen-info]')).not.toBeNull()
		expect(toggle(container, 'Numbers').getAttribute('aria-pressed')).toBe('false')
	})

	it('puts the screen’s own buttons left of the toggles, a separator between, and runs them', async () => {
		const onclick = vi.fn()
		const { container } = render(ScreenShellTest, {
			props: {
				...base,
				info,
				toolbar: { add: [{ id: 'sync', label: 'Sync now', icon: 'i-sync', onclick }] }
			}
		})
		const toolbar = q(container, '[data-screen-tools] [data-toolbar]')!
		const kinds = [...toolbar.children].map((el) =>
			el.hasAttribute('data-toolbar-separator') ? '|' : el.getAttribute('aria-label')
		)

		expect(kinds).toEqual(['Sync now', '|', 'What it’s for'])
		await fireEvent.click(toggle(container, 'Sync now'))
		expect(onclick).toHaveBeenCalledTimes(1)
	})

	it('drops a default toggle the screen removes', () => {
		const { container } = render(ScreenShellTest, {
			props: { ...base, info, withSidebar: true, toolbar: { remove: ['side'] } }
		})

		expect(toggles(container).map((t) => t.label)).toEqual(['What it’s for'])
		expect(q(container, '[data-screen-sidebar]')).not.toBeNull()
	})
})

describe('ScreenShell — search', () => {
	it('puts a search field first, with the screen’s placeholder', () => {
		const { container } = render(ScreenShellTest, {
			props: { ...base, info, search: { placeholder: 'Search modules' } }
		})
		const tools = q(container, '[data-screen-tools]')!
		const input = q(tools, '[data-screen-search] input') as HTMLInputElement

		expect(tools.firstElementChild?.matches('[data-screen-search]')).toBe(true)
		expect(input.placeholder).toBe('Search modules')
		expect(input.type).toBe('search')
	})

	it('writes its text into values.q after the debounce', async () => {
		vi.useFakeTimers()
		const onfilter = vi.fn()
		const { container } = render(ScreenShellTest, { props: { ...base, onfilter } })
		const input = q(container, '[data-screen-search] input') as HTMLInputElement

		input.value = 'sync'
		await fireEvent.input(input)
		expect(onfilter).not.toHaveBeenCalled()
		vi.advanceTimersByTime(300)
		flushSync()
		vi.useRealTimers()

		expect(onfilter).toHaveBeenCalledWith({ values: { q: 'sync' }, stat: null })
		expect(json(container, '[data-test-filter]')).toEqual({ values: { q: 'sync' }, stat: null })
	})

	it('shows a q set from outside', () => {
		const { container } = render(ScreenShellTest, {
			props: { ...base, filter: { values: { q: 'dojo' }, stat: null } }
		})

		expect((q(container, '[data-screen-search] input') as HTMLInputElement).value).toBe('dojo')
	})

	it('keeps what is being typed when another filter change lands before the debounce', async () => {
		vi.useFakeTimers()
		const { container } = render(ScreenShellTest, { props: { ...base, stats } })
		const input = q(container, '[data-screen-search] input') as HTMLInputElement

		input.value = 'syn'
		await fireEvent.input(input)
		await fireEvent.click(card(container, 'Failing'))
		flushSync()
		expect(input.value).toBe('syn')
		vi.advanceTimersByTime(300)
		flushSync()
		vi.useRealTimers()

		expect(json(container, '[data-test-filter]')).toEqual({
			values: { who: 'failing', q: 'syn' },
			stat: 'failing'
		})
	})

	it('follows a q changed from outside after it mounts', async () => {
		const { container, rerender } = render(ScreenShellTest, { props: { ...base } })

		await rerender({ ...base, filter: { values: { q: 'later' }, stat: null } })
		expect((q(container, '[data-screen-search] input') as HTMLInputElement).value).toBe('later')
	})
})

describe('ScreenShell — stats', () => {
	it('draws a card per stat, sized from its content', () => {
		const { container } = render(ScreenShellTest, { props: { ...base, stats } })
		const cards = qa(container, '[data-screen-stats] [data-stat-card]')

		expect(cards.map((c) => c.querySelector('[data-stat-card-label]')?.textContent)).toEqual([
			'Needs you',
			'Failing',
			'Dōjōs',
			'Repos'
		])
		expect(cards.map((c) => c.getAttribute('data-span'))).toEqual(['2', '1', '1', '1'])
		expect(card(container, 'Failing').querySelector('[data-stat-card-mark]')?.textContent).toBe(
			'難'
		)
	})

	it('keeps two description lines on every card when any card has a description', () => {
		const { container } = render(ScreenShellTest, { props: { ...base, stats } })

		expect(qa(container, '[data-stat-card] [data-stat-card-description]')).toHaveLength(4)
	})

	it('reserves no description lines when no card has one', () => {
		const { container } = render(ScreenShellTest, {
			props: { ...base, stats: stats.map(({ description: _d, ...s }) => s) }
		})

		expect(qa(container, '[data-stat-card-description]')).toHaveLength(0)
	})

	it('a stat with a filter is a toggle that applies it and shows pressed; again clears it', async () => {
		const onfilter = vi.fn()
		const { container } = render(ScreenShellTest, {
			props: { ...base, stats, filter: { values: { who: 'anyone' }, stat: null }, onfilter }
		})

		expect(card(container, 'Failing').tagName).toBe('BUTTON')
		expect(card(container, 'Failing').getAttribute('aria-pressed')).toBe('false')

		await fireEvent.click(card(container, 'Failing'))
		expect(onfilter).toHaveBeenLastCalledWith({ values: { who: 'failing' }, stat: 'failing' })
		expect(card(container, 'Failing').getAttribute('aria-pressed')).toBe('true')
		expect(json(container, '[data-test-filter]')).toEqual({
			values: { who: 'failing' },
			stat: 'failing'
		})

		await fireEvent.click(card(container, 'Failing'))
		expect(json(container, '[data-test-filter]')).toEqual({ values: { who: 'anyone' }, stat: null })
		expect(card(container, 'Failing').getAttribute('aria-pressed')).toBe('false')
	})

	it('a stat with neither filter nor href is a plain, non-interactive card', () => {
		const { container } = render(ScreenShellTest, { props: { ...base, stats } })
		const plain = card(container, 'Dōjōs')

		expect(plain.tagName).toBe('DIV')
		expect(plain.hasAttribute('data-stat-card-interactive')).toBe(false)
		expect(plain.hasAttribute('aria-pressed')).toBe(false)
	})

	it('a stat with an href links there', () => {
		const { container } = render(ScreenShellTest, { props: { ...base, stats } })

		expect(card(container, 'Repos').querySelector('a')?.getAttribute('href')).toBe('/repos')
	})

	it('says the stats are still being read when they are null', () => {
		const { container } = render(ScreenShellTest, { props: { ...base, stats: null } })

		expect(q(container, '[data-screen-stats] [data-screen-stats-reading]')?.textContent).toBe(
			'Reading…'
		)
		expect(toggles(container).map((t) => t.label)).toEqual(['Numbers'])
	})
})

describe('ScreenShell — filters band', () => {
	it('hands a snippet band the values and a setter; a hand change to the stat’s key clears the stat', async () => {
		const { container } = render(ScreenShellTest, {
			props: { ...base, stats, withFilterSnippet: true }
		})

		await fireEvent.click(card(container, 'Failing'))
		expect(q(container, '[data-test-who]')?.textContent).toBe('failing')

		await fireEvent.click(q(container, '[data-test-set]')!)
		expect(json(container, '[data-test-filter]')).toEqual({ values: { who: 'admin' }, stat: null })
		expect(card(container, 'Failing').getAttribute('aria-pressed')).toBe('false')
	})

	it('clear() empties the values', async () => {
		const { container } = render(ScreenShellTest, {
			props: {
				...base,
				withFilterSnippet: true,
				filter: { values: { who: 'you', q: 'x' }, stat: null }
			}
		})

		await fireEvent.click(q(container, '[data-test-clear]')!)
		expect(json(container, '[data-test-filter]')).toEqual({ values: {}, stat: null })
	})

	it('shows the active stat as a chip whose Clear restores the value', async () => {
		const { container } = render(ScreenShellTest, {
			props: {
				...base,
				stats,
				withFilterSnippet: true,
				filter: { values: { who: 'anyone' }, stat: null }
			}
		})

		expect(q(container, '[data-screen-filter-chip]')).toBeNull()
		await fireEvent.click(card(container, 'Failing'))
		const chip = q(container, '[data-screen-filter-chip]')!
		expect(chip.textContent).toContain('From a stat')
		expect(chip.querySelector('strong')?.textContent).toBe('Failing')

		await fireEvent.click(chip.querySelector('button')!)
		expect(json(container, '[data-test-filter]')).toEqual({ values: { who: 'anyone' }, stat: null })
		expect(q(container, '[data-screen-filter-chip]')).toBeNull()
	})

	it('draws a schema band with FormRenderer: a stat’s value shows in its field, a field writes back', async () => {
		const filters = {
			schema: { type: 'object', properties: { who: { type: 'string' } } },
			layout: { type: 'vertical', elements: [{ scope: '#/who', label: 'Who acts' }] },
			actions: [{ id: 'reset', label: 'Reset', icon: 'i-reset', onclick: vi.fn() }]
		}
		const { container } = render(ScreenShellTest, { props: { ...base, stats, filters } })

		await fireEvent.click(card(container, 'Failing'))
		await tick()
		const input = q(
			container,
			'[data-screen-filters] [data-scope="#/who"] input'
		) as HTMLInputElement
		expect(input.value).toBe('failing')

		input.value = 'admin'
		await fireEvent.change(input)
		flushSync()
		expect(json(container, '[data-test-filter]')).toEqual({ values: { who: 'admin' }, stat: null })

		const reset = q(container, '[data-screen-filters] [data-toolbar-item][aria-label="Reset"]')!
		await fireEvent.click(reset)
		expect(filters.actions[0].onclick).toHaveBeenCalledTimes(1)
	})
})

describe('ScreenShell — info band', () => {
	it('draws three data columns: eyebrow, mark, title, lead; steps; and a value with its meter', () => {
		const { container } = render(ScreenShellTest, { props: { ...base, info } })
		const band = q(container, '[data-screen-info]')!
		const [framing, how, stat] = qa(band, '[data-screen-info-column]')

		expect(band.getAttribute('data-role')).toBe('accent')
		expect(q(framing, '[data-screen-info-label]')?.textContent).toBe('Use it to')
		expect(q(framing, '[data-screen-info-mark]')?.textContent).toBe('稽')
		expect(q(framing, '[data-screen-info-title]')?.textContent).toBe('See what reaches your dōjō')
		expect(q(framing, '[data-screen-info-text]')?.textContent).toBe('Every repository.')

		const steps = qa(how, '[data-screen-info-step]')
		expect(steps).toHaveLength(2)
		expect(q(steps[0], '[data-screen-info-step-mark]')?.textContent).toBe('場')
		expect(q(steps[0], '[data-screen-info-step-title]')?.textContent).toBe('Pick a project')
		expect(q(steps[0], '[data-screen-info-step-text]')?.textContent).toBe('Any of them.')
		expect(q(steps[1], '[data-screen-info-step-text]')).toBeNull()

		expect(q(stat, '[data-screen-info-value]')?.textContent).toBe('1')
		expect(q(stat, '[data-screen-info-total]')?.textContent).toBe('/ 3')
		const meter = q(stat, '[data-screen-info-meter]')!
		expect(meter.getAttribute('role')).toBe('meter')
		expect(meter.getAttribute('aria-valuenow')).toBe(String(1 / 3))
	})

	it('takes a snippet for a column, and another role for its wash', () => {
		const { container } = render(ScreenShellTest, {
			props: { ...base, info: info.slice(0, 2), withInfoSnippet: true, infoRole: 'warning' }
		})
		const columns = qa(container, '[data-screen-info-column]')

		expect(columns).toHaveLength(3)
		expect(q(columns[2], '[data-test-info-snippet]')?.textContent).toBe('Custom column')
		expect(q(container, '[data-screen-info]')?.getAttribute('data-role')).toBe('warning')
	})
})

describe('ScreenShell — layout parts', () => {
	it('puts the body and the sidebar in their own scroll regions, the sidebar on the right by default', () => {
		const { container } = render(ScreenShellTest, { props: { ...base, withSidebar: true } })
		const main = q(container, '[data-screen-main]')!

		expect(q(main, '[data-screen-body] [data-test-body]')).not.toBeNull()
		expect(q(main, '[data-screen-sidebar] [data-test-side]')).not.toBeNull()
		expect(main.lastElementChild?.matches('[data-screen-sidebar]')).toBe(true)
		expect(q(container, '[data-screen-sidebar]')?.getAttribute('data-side')).toBe('right')
	})

	it('draws a footer from its three parts, or from a snippet', () => {
		const parts = render(ScreenShellTest, {
			props: { ...base, footer: { left: '157 scanned', mid: '4 min ago', right: 'Activity' } }
		})
		expect(
			qa(parts.container, '[data-screen-footer] > span').map((s) => [
				s.getAttribute('data-part'),
				s.textContent
			])
		).toEqual([
			['left', '157 scanned'],
			['mid', '4 min ago'],
			['right', 'Activity']
		])

		const snippet = render(ScreenShellTest, { props: { ...base, withFooterSnippet: true } })
		expect(q(snippet.container, '[data-screen-footer] [data-test-foot]')).not.toBeNull()
	})
})

describe('ScreenShell — persists nothing', () => {
	it('writes no storage and no cookie while panels, stats, search and filters change', async () => {
		vi.useFakeTimers()
		const setItem = vi.spyOn(Storage.prototype, 'setItem')
		const cookie = document.cookie
		const { container } = render(ScreenShellTest, {
			props: { ...base, info, stats, withSidebar: true, withFilterSnippet: true }
		})

		await fireEvent.click(toggle(container, 'What it’s for'))
		await fireEvent.click(card(container, 'Failing'))
		await fireEvent.click(q(container, '[data-test-set]')!)
		const input = q(container, '[data-screen-search] input') as HTMLInputElement
		input.value = 'abc'
		await fireEvent.input(input)
		vi.advanceTimersByTime(1000)
		vi.useRealTimers()

		expect(setItem).not.toHaveBeenCalled()
		expect(document.cookie).toBe(cookie)
	})
})
