import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ObjectView from '../../src/schema/ObjectView.svelte'
import { DESIGN, ER_ONLY } from './design-fixture.js'

const open = (entityKey: string, props: Record<string, unknown> = {}) => {
	const onselect = vi.fn()
	const view = render(ObjectView, { model: DESIGN, entityKey, onselect, ...props })
	return { ...view, onselect }
}

const section = (root: HTMLElement, name: string) =>
	root.querySelector(`[data-graph-section="${name}"]`)
const deps = (root: HTMLElement, name: string) =>
	[...(section(root, name)?.querySelectorAll('[data-graph-design-dep]') ?? [])].map((d) =>
		d.getAttribute('data-graph-design-dep')
	)

describe('ObjectView', () => {
	it('heads the page with the qualified name, its kind and its usage counts', () => {
		const { container } = open('shop.place_order')
		const badges = [
			...container.querySelectorAll('[data-graph-design-head] [data-graph-design-badge]')
		].map((b) => b.textContent)

		expect(container.querySelector('[data-graph-design-title]')?.textContent).toBe('place_order')
		expect(badges).toEqual(['procedure', '3 uses · 0 used by'])
	})

	it('has Details and Diagram tabs', () => {
		const { container } = open('shop.order_totals')

		expect(
			[...container.querySelectorAll('[data-tabs-trigger]')].map((t) => t.textContent?.trim())
		).toEqual(['Details', 'Diagram'])
	})

	it('renders its note, or says there is none', () => {
		expect(section(open('shop.order_totals').container, 'info')?.textContent).toContain(
			'Per-order line count'
		)
		expect(section(open('shop.place_order').container, 'info')?.textContent).toContain(
			'No comment on this procedure.'
		)
	})

	it('lists what it reads, writes and calls, each with the verb, an unresolved one dimmed', () => {
		const { container } = open('shop.place_order')

		expect(deps(container, 'uses')).toEqual(['shop.orders', 'shop.order_totals', 'pg_catalog.now'])
		const builtin = container.querySelector('[data-graph-design-dep="pg_catalog.now"]')!
		expect(builtin.hasAttribute('data-unresolved')).toBe(true)
		expect(builtin.querySelector('button')).toBeNull()
		expect(builtin.textContent).toContain('calls')
	})

	it('lists what uses it, and opens either end', async () => {
		const { container, onselect } = open('shop.order_totals')

		expect(deps(container, 'used-by')).toEqual(['shop.place_order'])
		await fireEvent.click(
			container.querySelector('[data-graph-design-dep="shop.place_order"] button')!
		)
		expect(onselect).toHaveBeenCalledWith('shop.place_order')
	})

	it('says when it uses nothing, nothing uses it — and that a sequence is not traced', () => {
		const lonely = { ...DESIGN, deps: [] }
		const view = render(ObjectView, { model: lonely, entityKey: 'shop.order_totals' })
		expect(section(view.container, 'uses')?.textContent).toContain(
			'It reads, writes and calls nothing in this design.'
		)
		expect(section(view.container, 'used-by')?.textContent).toContain(
			'Nothing in this design uses it.'
		)

		expect(section(open('shop.orders_id_seq').container, 'used-by')?.textContent).toContain(
			'nextval() is not traced'
		)
	})

	it('draws its dependency graph on the Diagram tab', async () => {
		const { container } = open('shop.order_totals')

		await fireEvent.click([...container.querySelectorAll('[data-tabs-trigger]')][1])

		expect(container.querySelector('[data-graph-world]')?.getAttribute('data-graph-layout')).toBe(
			'neighborhood'
		)
		expect(container.querySelector('svg[role="img"]')?.getAttribute('aria-label')).toBe(
			'Dependencies of shop.order_totals'
		)
	})

	it('says when the key names no view or routine — as it does for a model with no entities', () => {
		expect(
			open('auth.users').container.querySelector('[data-graph-design-empty]')?.textContent
		).toBe('Entity not found.')
		const { container } = render(ObjectView, { model: ER_ONLY, entityKey: 'shop.order_totals' })
		expect(container.querySelector('[data-graph-design-empty]')?.textContent).toBe(
			'Entity not found.'
		)
	})
})
