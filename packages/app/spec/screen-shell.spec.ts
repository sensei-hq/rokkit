import { describe, it, expect } from 'vitest'
import {
	PANEL_IDS,
	isOpen,
	presentPanels,
	togglePanel,
	resolveToolbar,
	statSpan,
	applyStat,
	clearStat,
	setFilterValue,
	changedKeys
} from '../src/utils/screen-shell.js'
import type { FilterState, ShellStat } from '../src/types/screen-shell.js'

const labels = { info: 'What it’s for', stats: 'Numbers', filters: 'Filters', side: 'Side panel' }
const icons = { info: 'i-info', stats: 'i-stats', filters: 'i-filters', side: 'i-side' }
const ALL = [...PANEL_IDS]

describe('panels', () => {
	it('names the four bands in toolbar order', () => {
		expect(PANEL_IDS).toEqual(['info', 'stats', 'filters', 'side'])
	})

	it('reads a missing key as open, so a first visit opens everything', () => {
		expect(isOpen(undefined, 'info')).toBe(true)
		expect(isOpen({}, 'stats')).toBe(true)
		expect(isOpen({ stats: false }, 'stats')).toBe(false)
		expect(isOpen({ stats: true }, 'stats')).toBe(true)
	})

	it('lists only the bands the view has, in order', () => {
		expect(presentPanels({ side: true, info: true, stats: false })).toEqual(['info', 'side'])
	})

	it('writes the whole state for the bands the view has when one flips', () => {
		expect(togglePanel({}, 'info', ['info', 'stats'])).toEqual({ info: false, stats: true })
		expect(togglePanel({ info: false, stats: true }, 'info', ['info', 'stats'])).toEqual({
			info: true,
			stats: true
		})
	})

	it('never stores a band the view does not have', () => {
		expect(togglePanel({ side: false }, 'info', ['info'])).toEqual({ info: false })
		expect(togglePanel({}, 'side', ['info'])).toEqual({ info: true })
	})
})

describe('resolveToolbar', () => {
	const ctx = { present: ALL, panels: {}, labels, icons }

	it('defaults to one toggle per band the view has, pressed when open', () => {
		const items = resolveToolbar(undefined, {
			...ctx,
			present: ['info', 'side'],
			panels: { side: false }
		})
		expect(items).toEqual([
			{
				id: 'info',
				value: 'info',
				type: 'toggle',
				icon: 'i-info',
				label: 'What it’s for',
				active: true
			},
			{
				id: 'side',
				value: 'side',
				type: 'toggle',
				icon: 'i-side',
				label: 'Side panel',
				active: false
			}
		])
	})

	it('puts added buttons left of the toggles, a separator between, in the order given', () => {
		const sync = { id: 'sync', label: 'Sync now', icon: 'i-sync' }
		const settings = { id: 'settings', label: 'Connection settings', icon: 'i-cog' }
		const items = resolveToolbar({ add: [sync, settings] }, { ...ctx, present: ['info'] })
		expect(items.map((i) => i.type)).toEqual(['button', 'button', 'separator', 'toggle'])
		expect(items.map((i) => i.id ?? '|')).toEqual(['sync', 'settings', '|', 'info'])
		expect(items[0]).toMatchObject({ id: 'sync', value: 'sync', label: 'Sync now', icon: 'i-sync' })
	})

	it('drops a default by id', () => {
		const items = resolveToolbar({ remove: ['side'] }, ctx)
		expect(items.map((i) => i.id)).toEqual(['info', 'stats', 'filters'])
	})

	it('draws no separator when there are no toggles left', () => {
		const items = resolveToolbar(
			{ add: [{ id: 'a', label: 'A', icon: 'i-a' }], remove: ['info'] },
			{ ...ctx, present: ['info'] }
		)
		expect(items.map((i) => i.type)).toEqual(['button'])
	})

	it('shows a disabled action’s reason with its label, and disables a busy one', () => {
		const items = resolveToolbar(
			{
				add: [
					{ id: 'sync', label: 'Sync now', icon: 'i-sync', disabled: 'Sign in first' },
					{ id: 'copy', label: 'Copy', icon: 'i-copy', busy: true }
				]
			},
			{ ...ctx, present: [] }
		)
		expect(items[0]).toMatchObject({ disabled: true, label: 'Sync now — Sign in first' })
		expect(items[1]).toMatchObject({ disabled: true })
	})

	it('takes a full list as is, toggles for absent bands dropped and the rest pressed from panels', () => {
		const items = resolveToolbar(
			[
				{ id: 'side', value: 'side', type: 'toggle', icon: 'x', label: 'Side' },
				{ type: 'separator' },
				{ id: 'go', label: 'Go', icon: 'i-go' },
				{ id: 'stats', value: 'stats', type: 'toggle', icon: 'y', label: 'Stats' }
			],
			{ ...ctx, present: ['side'], panels: { side: false } }
		)
		expect(items.map((i) => i.id ?? i.type)).toEqual(['side', 'separator', 'go'])
		expect(items[0].active).toBe(false)
	})
})

describe('statSpan', () => {
	it('gives a short title with no description one column', () => {
		expect(statSpan({ title: 'Modules', value: 42 })).toBe(1)
	})

	it('gives a longer title or a short description two', () => {
		expect(statSpan({ title: 'Needs an admin', value: 5 })).toBe(2)
		expect(statSpan({ title: 'Cycles', value: 2, description: 'Each says what to try' })).toBe(2)
	})

	it('gives a description over 32 characters three', () => {
		expect(
			statSpan({ title: 'Cycles', value: 2, description: 'Shows only the modules in a cycle' })
		).toBe(3)
	})

	it('widens a card whose value is long', () => {
		expect(statSpan({ title: 'Ratio', value: '12 · 30 · 41' })).toBe(2)
	})

	it('honours a span the stat asks for, within 1–12', () => {
		expect(statSpan({ title: 'Modules', value: 1, span: 4 })).toBe(4)
		expect(statSpan({ title: 'Modules', value: 1, span: 40 })).toBe(12)
	})
})

describe('stat filters', () => {
	const failing: ShellStat = {
		id: 'failing',
		title: 'Failing',
		value: 2,
		filter: { key: 'who', value: 'failing' }
	}
	const you: ShellStat = {
		id: 'you',
		title: 'Needs you',
		value: 1,
		filter: { key: 'who', value: 'you' }
	}
	const cycles: ShellStat = {
		id: 'cycles',
		title: 'Cycles',
		value: 2,
		filter: { key: 'show', value: 'cycle' }
	}
	const stats = [failing, you, cycles]
	const start: FilterState = { values: { who: 'anyone', q: 'sync' }, stat: null }

	it('applies a stat: sets its key and marks it active', () => {
		const { filter, memory } = applyStat(start, failing, null)
		expect(filter).toEqual({ values: { who: 'failing', q: 'sync' }, stat: 'failing' })
		expect(memory).toEqual({ stat: 'failing', key: 'who', had: true, value: 'anyone' })
	})

	it('clicking the active stat again restores the key’s previous value and clears it', () => {
		const once = applyStat(start, failing, null)
		const twice = applyStat(once.filter, failing, once.memory)
		expect(twice.filter).toEqual(start)
		expect(twice.memory).toBeNull()
	})

	it('removes a key the stat added when it is cleared', () => {
		const once = applyStat({ values: {}, stat: null }, cycles, null)
		expect(clearStat(once.filter, stats, once.memory).filter).toEqual({ values: {}, stat: null })
	})

	it('switching stats on one key restores the original value on clear, not the first stat’s', () => {
		const a = applyStat(start, failing, null)
		const b = applyStat(a.filter, you, a.memory)
		expect(b.filter).toEqual({ values: { who: 'you', q: 'sync' }, stat: 'you' })
		expect(clearStat(b.filter, stats, b.memory).filter).toEqual(start)
	})

	it('switching to a stat on another key puts the first key back', () => {
		const a = applyStat(start, failing, null)
		const b = applyStat(a.filter, cycles, a.memory)
		expect(b.filter).toEqual({
			values: { who: 'anyone', q: 'sync', show: 'cycle' },
			stat: 'cycles'
		})
	})

	it('clears an active stat it holds no memory for by removing its key', () => {
		const restored: FilterState = { values: { who: 'failing' }, stat: 'failing' }
		expect(clearStat(restored, stats, null).filter).toEqual({ values: {}, stat: null })
	})

	it('switching away from a stat it holds no memory for removes that stat’s key', () => {
		const restored: FilterState = { values: { show: 'cycle' }, stat: 'cycles' }
		expect(applyStat(restored, failing, null, stats).filter).toEqual({
			values: { who: 'failing' },
			stat: 'failing'
		})
	})

	it('clearing with no active stat changes nothing', () => {
		expect(clearStat(start, stats, null)).toEqual({ filter: start, memory: null })
	})

	it('changing the stat’s key by hand clears the stat but keeps the new value', () => {
		const a = applyStat(start, failing, null)
		const b = setFilterValue(a.filter, 'who', 'admin', { stats, memory: a.memory })
		expect(b.filter).toEqual({ values: { who: 'admin', q: 'sync' }, stat: null })
		expect(b.memory).toBeNull()
	})

	it('changing another key leaves the stat active', () => {
		const a = applyStat(start, failing, null)
		const b = setFilterValue(a.filter, 'q', 'dojo', { stats, memory: a.memory })
		expect(b.filter).toEqual({ values: { who: 'failing', q: 'dojo' }, stat: 'failing' })
		expect(b.memory).toEqual(a.memory)
	})

	it('ignores a memory that belongs to another stat than the active one', () => {
		const a = applyStat(start, cycles, null)
		// The host replaced the filter from outside: `failing` is active, the memory is cycles'.
		const replaced: FilterState = { values: { who: 'failing', show: 'cycle' }, stat: 'failing' }
		expect(clearStat(replaced, stats, a.memory).filter).toEqual({
			values: { show: 'cycle' },
			stat: null
		})
		expect(setFilterValue(replaced, 'who', 'x', { stats, memory: a.memory }).filter.stat).toBeNull()
	})

	it('ignores a stat with no filter', () => {
		const plain: ShellStat = { id: 'dojos', title: 'Dōjōs', value: 3 }
		expect(applyStat(start, plain, null)).toEqual({ filter: start, memory: null })
	})
})

describe('changedKeys', () => {
	it('lists the keys whose value differs, added keys included', () => {
		expect(changedKeys({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 })).toEqual(['b', 'c'])
	})

	it('lists a key that was removed', () => {
		expect(changedKeys({ a: 1, b: 2 }, { a: 1 })).toEqual(['b'])
	})
})
