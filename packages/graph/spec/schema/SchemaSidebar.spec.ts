import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import SchemaSidebar from '../../src/schema/SchemaSidebar.svelte'
import { DESIGN, ER_ONLY } from './design-fixture.js'

const open = (props: Record<string, unknown> = {}) => {
	const onselect = vi.fn()
	const view = render(SchemaSidebar, { model: DESIGN, onselect, ...props })
	return { ...view, onselect }
}

/** The tree's rows, by label — groups and objects alike, in the order shown. */
const rows = (root: HTMLElement) =>
	[...root.querySelectorAll('[data-tree-item-content]')].map((b) => b.getAttribute('aria-label'))

const row = (root: HTMLElement, label: string) =>
	root.querySelector<HTMLElement>(`[data-tree-item-content][aria-label="${label}"]`)!

describe('SchemaSidebar', () => {
	it('is a rokkit Tree of the schemas, each object under its schema', () => {
		const { container } = open()

		expect(container.querySelector('[data-tree]')).not.toBeNull()
		expect(rows(container)).toEqual([
			'auth',
			'sessions',
			'users',
			'shop',
			'customers',
			'order_items',
			'orders',
			'products',
			'order_totals',
			'place_order',
			'orders_id_seq',
			'order_status'
		])
	})

	it('counts each schema and wears each object its kind icon', () => {
		const { container } = open()

		expect(row(container, 'shop').querySelector('[data-item-badge]')?.textContent).toBe('8')
		expect(row(container, 'order_totals').querySelector('.i-glyph\\:split-view')).not.toBeNull()
		expect(row(container, 'order_status').querySelector('.i-glyph\\:tag')).not.toBeNull()
	})

	it('offers a chip for each kind the design has, with its count', () => {
		const { container } = open()
		const chips = [...container.querySelectorAll('[data-graph-design-chip]')].map((c) => [
			c.getAttribute('data-graph-design-chip'),
			c.textContent?.replace(/\s+/g, ' ').trim()
		])

		expect(chips).toEqual([
			['table', 'Tables 6'],
			['view', 'View 1'],
			['procedure', 'Procedure 1'],
			['sequence', 'Sequence 1'],
			['enum', 'Enum 1']
		])
	})

	it('hides a kind that is switched off, and a schema left with nothing', async () => {
		const { container } = open()
		const chip = container.querySelector<HTMLElement>('[data-graph-design-chip="table"]')!

		await fireEvent.click(chip)

		expect(chip.getAttribute('aria-pressed')).toBe('false')
		expect(rows(container)).toEqual([
			'shop',
			'order_totals',
			'place_order',
			'orders_id_seq',
			'order_status'
		])

		await fireEvent.click(chip)
		expect(rows(container)).toContain('users')
	})

	it('searches names within the kinds that are on', async () => {
		const { container } = open()
		await fireEvent.click(container.querySelector('[data-graph-design-chip="table"]')!)
		await fireEvent.input(container.querySelector('[data-graph-design-search]')!, {
			target: { value: 'place' }
		})

		expect(rows(container)).toEqual(['shop', 'place_order'])
	})

	it('says why the tree is empty', async () => {
		const { container } = open()
		const search = container.querySelector<HTMLInputElement>('[data-graph-design-search]')!

		await fireEvent.input(search, { target: { value: 'zzz' } })
		expect(container.querySelector('[data-graph-design-empty]')?.textContent).toBe(
			'Nothing matches “zzz”.'
		)

		await fireEvent.input(search, { target: { value: '' } })
		for (const chip of container.querySelectorAll<HTMLElement>('[data-graph-design-chip]'))
			await fireEvent.click(chip)
		expect(container.querySelector('[data-graph-design-empty]')?.textContent).toBe(
			'Every entity type is switched off.'
		)
	})

	it('says so when the design has no objects at all, and offers no chips', () => {
		const { container } = open({ model: { tables: [], refs: [] } })

		expect(container.querySelector('[data-graph-design-empty]')?.textContent).toBe(
			'This design has no entities.'
		)
		expect(container.querySelector('[data-graph-design-chip]')).toBeNull()
	})

	it('selects the object a reader picks — never a schema', async () => {
		const { container, onselect } = open()

		await fireEvent.click(row(container, 'order_totals'))
		expect(onselect).toHaveBeenCalledWith('shop.order_totals')

		onselect.mockClear()
		await fireEvent.click(row(container, 'auth'))
		expect(onselect).not.toHaveBeenCalled()
	})

	it('marks the selected object', () => {
		const { container } = open({ value: 'auth.users' })

		expect(row(container, 'users').hasAttribute('data-active')).toBe(true)
	})

	it('heads the tree with the design name, which returns to the overview', async () => {
		const { container, onselect } = open({ value: 'auth.users' })
		const home = container.querySelector<HTMLElement>('[data-graph-design-home]')!

		expect(home.textContent?.trim()).toBe('shopdb')
		await fireEvent.click(home)
		expect(onselect).toHaveBeenCalledWith(null)
	})

	it('has no home row when the design has no name', () => {
		const { container } = open({ model: ER_ONLY })

		expect(container.querySelector('[data-graph-design-home]')).toBeNull()
	})

	it('has no home row when the host already heads the page with the design', () => {
		const { container } = open({ home: false })

		expect(container.querySelector('[data-graph-design-home]')).toBeNull()
		expect(row(container, 'users')).toBeTruthy()
	})

	it('sits on either side — the host decides, the border follows', () => {
		expect(
			open().container.querySelector('[data-graph-design-sidebar]')?.getAttribute('data-side')
		).toBe('left')
		expect(
			open({ side: 'right' })
				.container.querySelector('[data-graph-design-sidebar]')
				?.getAttribute('data-side')
		).toBe('right')
	})
})
