import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import EnumView from '../../src/schema/EnumView.svelte'
import { DESIGN, ER_ONLY } from './design-fixture.js'

const open = (entityKey: string, model = DESIGN) => {
	const onselect = vi.fn()
	const view = render(EnumView, { model, entityKey, onselect })
	return { ...view, onselect }
}

const section = (root: HTMLElement, name: string) =>
	root.querySelector(`[data-graph-section="${name}"]`)

describe('EnumView', () => {
	it('heads the page with the qualified name, its kind and its value count', () => {
		const { container } = open('shop.order_status')
		const badges = [
			...container.querySelectorAll('[data-graph-design-head] [data-graph-design-badge]')
		].map((b) => b.textContent)

		expect(container.querySelector('[data-graph-design-schema]')?.textContent).toBe('shop.')
		expect(container.querySelector('[data-graph-design-title]')?.textContent).toBe('order_status')
		expect(badges).toEqual(['enum', '3 values'])
	})

	it('renders its note', () => {
		expect(section(open('shop.order_status').container, 'info')?.textContent).toContain('lifecycle')
	})

	it('lists its values in declaration order, numbered', () => {
		const { container } = open('shop.order_status')
		const values = [...container.querySelectorAll('[data-graph-design-value]')].map((v) =>
			v.textContent?.replace(/\s+/g, ' ').trim()
		)

		expect(values).toEqual(['1 pending', '2 paid', '3 shipped'])
	})

	it('lists the columns of its type, each opening its table', async () => {
		const { container, onselect } = open('shop.order_status')
		const used = [...container.querySelectorAll('[data-graph-design-column]')].map((c) =>
			c.textContent?.trim()
		)

		expect(used).toEqual(['shop.orders.status', 'shop.order_items.state'])
		await fireEvent.click(container.querySelector('[data-graph-design-column] button')!)
		expect(onselect).toHaveBeenCalledWith('shop.orders')
	})

	it('says when no column is of its type, and when it has no note', () => {
		const model = { ...DESIGN, tables: [], enums: [{ schema: 's', name: 'mood', values: ['ok'] }] }
		const { container } = open('s.mood', model)

		expect(section(container, 'used-by')?.textContent).toContain(
			'No column in this design is of this type.'
		)
		expect(section(container, 'info')?.textContent).toContain('No comment on this enum.')
	})

	it('says when the key names no enum — as it does for a model with no enums', () => {
		expect(
			open('auth.users').container.querySelector('[data-graph-design-empty]')?.textContent
		).toBe('Entity not found.')
		expect(
			open('shop.order_status', ER_ONLY).container.querySelector('[data-graph-design-empty]')
				?.textContent
		).toBe('Entity not found.')
	})
})
