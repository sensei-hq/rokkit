import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import TableView from '../../src/schema/TableView.svelte'
import { DESIGN, ER_ONLY } from './design-fixture.js'

const open = (entityKey: string, props: Record<string, unknown> = {}) => {
	const onselect = vi.fn()
	const view = render(TableView, { model: DESIGN, entityKey, onselect, ...props })
	return { ...view, onselect }
}

const cell = (root: HTMLElement, column: string, name: string) =>
	root.querySelector(`[data-graph-design-field="${column}"] [data-cell="${name}"]`)

const section = (root: HTMLElement, name: string) =>
	root.querySelector(`[data-graph-section="${name}"]`)

describe('TableView', () => {
	it('heads the page with the qualified name, its column count and its key counts', () => {
		const { container } = open('shop.customers')

		expect(container.querySelector('[data-graph-design-schema]')?.textContent).toBe('shop.')
		expect(container.querySelector('[data-graph-design-title]')?.textContent).toBe('customers')
		const badges = [
			...container.querySelectorAll('[data-graph-design-head] [data-graph-design-badge]')
		].map((b) => b.textContent)
		expect(badges).toEqual(['3 columns', '2 out · 1 in'])
	})

	it('has Details and Diagram tabs, opening on Details', () => {
		const { container } = open('auth.users')
		const tabs = [...container.querySelectorAll('[data-tabs-trigger]')].map((t) =>
			t.textContent?.trim()
		)

		expect(tabs).toEqual(['Details', 'Diagram'])
		expect(section(container, 'fields')).not.toBeNull()
	})

	it('renders the table comment, or says there is none', () => {
		expect(section(open('auth.users').container, 'info')?.textContent).toContain('Account records')
		expect(section(open('auth.sessions').container, 'info')?.textContent).toContain(
			'No comment on this table.'
		)
	})

	it('tables every field: name, type, settings badges, default, references and notes', () => {
		const { container } = open('auth.users')

		expect(container.querySelectorAll('[data-graph-design-field]')).toHaveLength(4)
		expect(cell(container, 'id', 'type')?.textContent).toBe('uuid')
		expect(
			[...container.querySelectorAll('[data-graph-design-field="id"] [data-row-badge]')].map(
				(b) => b.textContent
			)
		).toEqual(['PK', 'NN'])
		expect(
			[...container.querySelectorAll('[data-graph-design-field="email"] [data-row-badge]')].map(
				(b) => b.textContent
			)
		).toEqual(['NN', 'UNIQUE'])
		expect(cell(container, 'created_at', 'default')?.textContent).toBe('now()')
		expect(cell(container, 'name', 'default')?.textContent).toBe('—')
		expect(cell(container, 'id', 'notes')?.textContent).toContain('Primary key.')
		expect(cell(container, 'name', 'notes')?.textContent).toBe('—')
	})

	it('badges ENUM, IDENTITY and GENERATED, and says how such a value arrives', () => {
		const { container } = open('shop.orders')
		const badges = (col: string) =>
			[...container.querySelectorAll(`[data-graph-design-field="${col}"] [data-row-badge]`)].map(
				(b) => b.textContent
			)

		expect(badges('status')).toEqual(['NN', 'ENUM'])
		expect(badges('id')).toEqual(['PK', 'NN', 'IDENTITY'])
		expect(badges('total')).toEqual(['GENERATED'])
		expect(cell(container, 'id', 'default')?.textContent).toBe('generated always as identity')
	})

	it("links a field's reference to its table, marking a stub target", async () => {
		const { container, onselect } = open('shop.customers')
		const target = cell(container, 'region_id', 'refs')

		expect(target?.textContent).toContain('geo.regions.id')
		expect(target?.querySelector('[data-graph-design-stub]')?.textContent).toBe('external')

		await fireEvent.click(cell(container, 'user_id', 'refs')!.querySelector('button')!)
		expect(onselect).toHaveBeenCalledWith('auth.users')
	})

	it('lists the foreign keys out and in, each opening the other table', async () => {
		const { container, onselect } = open('shop.customers')
		const refs = [...container.querySelectorAll('[data-graph-design-ref]')].map(
			(r) =>
				`${r.getAttribute('data-graph-design-ref')}:${r.textContent?.replace(/\s+/g, ' ').trim()}`
		)

		expect(refs).toEqual([
			'out:out user_id → auth.users.id',
			'out:out region_id → geo.regions.id external',
			'in:in shop.orders.customer_id → id'
		])
		await fireEvent.click(container.querySelector('[data-graph-design-ref="in"]')!)
		expect(onselect).toHaveBeenCalledWith('shop.orders')
	})

	it('shows the action a foreign key takes', () => {
		const { container } = open('auth.sessions')

		expect(container.querySelector('[data-graph-design-ref="out"]')?.textContent).toContain(
			'cascade'
		)
	})

	it('says when there are no foreign keys', () => {
		const lonely = { ...DESIGN, refs: [] }
		const { container } = render(TableView, { model: lonely, entityKey: 'auth.users' })

		expect(section(container, 'references')?.textContent).toContain('No foreign keys in or out.')
	})

	it('lists what depends on the table, opening each', async () => {
		const { container, onselect } = open('shop.orders')
		const deps = [...container.querySelectorAll('[data-graph-design-dep]')].map((d) =>
			d.getAttribute('data-graph-design-dep')
		)

		expect(deps).toEqual(['shop.order_totals', 'shop.place_order'])
		await fireEvent.click(
			container.querySelector('[data-graph-design-dep="shop.place_order"] button')!
		)
		expect(onselect).toHaveBeenCalledWith('shop.place_order')
	})

	it('says nothing depends on it — or, with no dependency graph, leaves the section out', () => {
		expect(section(open('auth.users').container, 'dependencies')?.textContent).toContain(
			'Nothing reads, writes or calls this table.'
		)
		const { container } = render(TableView, { model: ER_ONLY, entityKey: 'auth.users' })
		expect(section(container, 'dependencies')).toBeNull()
	})

	it('lists indexes with their predicate and uniqueness, and the checks', () => {
		const { container } = open('auth.users')

		expect(
			container.querySelectorAll('[data-graph-section="indexes"] [data-graph-index]')
		).toHaveLength(3)
		expect(section(container, 'indexes')?.textContent).toContain('where created_at > now()')
		expect(section(container, 'checks')?.textContent).toContain("email like '%@%'")
		expect(section(container, 'checks')?.textContent).toContain('users_email_check')
		expect(section(open('auth.sessions').container, 'checks')).toBeNull()
	})

	it('opens a stub as a table page that says why it is one', () => {
		const { container } = open('geo.regions')

		expect(
			container.querySelector('[data-graph-design-head] [data-graph-design-badge]')?.textContent
		).toBe('external')
		expect(section(container, 'info')?.textContent).toContain('Declared external')
		expect(section(container, 'info')?.textContent).toContain(
			'Only the columns its foreign keys land on are shown.'
		)
	})

	it.each([
		['out_of_scope', 'leaves out'],
		['unresolved', 'defined nowhere']
	])('explains a %s stub', (kind, words) => {
		const model = { ...DESIGN, stubs: [{ ...DESIGN.stubs![0], kind }] }
		const { container } = render(TableView, { model, entityKey: 'geo.regions' })

		expect(section(container, 'info')?.textContent).toContain(words)
	})

	it("draws the table's neighbourhood on the Diagram tab, and walks to a neighbour", async () => {
		const { container } = open('shop.orders')

		await fireEvent.click([...container.querySelectorAll('[data-tabs-trigger]')][1])

		expect(section(container, 'fields')).toBeNull()
		expect(container.querySelector('[data-graph-world]')?.getAttribute('data-graph-layout')).toBe(
			'neighborhood'
		)
		expect(container.querySelector('svg[role="img"]')?.getAttribute('aria-label')).toBe(
			'Relationships of shop.orders'
		)
	})

	it('returns to Details when it is handed another table', async () => {
		const { container, rerender } = open('shop.orders')
		await fireEvent.click([...container.querySelectorAll('[data-tabs-trigger]')][1])

		await rerender({ entityKey: 'auth.users' })

		expect(section(container, 'fields')).not.toBeNull()
	})

	it('says when the key names no table', () => {
		const { container } = open('shop.order_totals')

		expect(container.querySelector('[data-graph-design-empty]')?.textContent).toBe(
			'Entity not found.'
		)
	})
})
