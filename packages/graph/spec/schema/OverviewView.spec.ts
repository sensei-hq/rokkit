import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import OverviewView from '../../src/schema/OverviewView.svelte'
import { DESIGN, ER_ONLY } from './design-fixture.js'

const cards = (root: HTMLElement) =>
	[...root.querySelectorAll('[data-graph-design-card]')].map(
		(c) =>
			`${c.getAttribute('data-graph-design-card')}:${c.querySelector('[data-stat-card-value]')?.textContent} ${c.querySelector('[data-stat-card-label]')?.textContent}`
	)

describe('OverviewView', () => {
	it('names the dialect and the model version', () => {
		const { container } = render(OverviewView, { model: DESIGN })

		expect(container.querySelector('[data-graph-design-dialect]')?.textContent).toBe('PostgreSQL')
		expect(container.querySelector('[data-graph-design-version]')?.textContent).toBe(
			'schema model v3'
		)
	})

	it('shows a card for each kind the design has, and no other', () => {
		const { container } = render(OverviewView, { model: DESIGN })

		expect(cards(container)).toEqual([
			'schemas:2 Schemas',
			'tables:6 Tables',
			'view:1 View',
			'procedure:1 Procedure',
			'sequence:1 Sequence',
			'enums:1 Enum',
			'references:6 References'
		])
	})

	it('draws each count as a stat card wearing its kind’s icon', () => {
		const { container } = render(OverviewView, { model: DESIGN })
		const view = container.querySelector('[data-graph-design-card="view"]')

		expect(view?.matches('[data-stat-card]')).toBe(true)
		expect(view?.querySelector('[data-stat-card-icon]')?.className).toBe('i-glyph:split-view')
	})

	it('leaves the counts out when the host shows them elsewhere', () => {
		const { container } = render(OverviewView, { model: DESIGN, counts: false })

		expect(container.querySelector('[data-graph-section="counts"]')).toBeNull()
		expect(container.querySelectorAll('[data-graph-design-schema-row]')).toHaveLength(2)
	})

	it('tables the schemas with their tables, enums and views & routines', () => {
		const { container } = render(OverviewView, { model: DESIGN })
		const rows = [...container.querySelectorAll('[data-graph-design-schema-row]')].map((r) =>
			[...r.querySelectorAll('td')].map((td) => td.textContent?.trim())
		)

		expect(rows).toEqual([
			['auth', '2', '—', '—'],
			['shop', '4', '1', '3']
		])
	})

	it('leaves out a column the model does not carry rather than filling it with zeros', () => {
		const { container } = render(OverviewView, { model: ER_ONLY })
		const head = [...container.querySelectorAll('[data-graph-design-table] th')].map(
			(th) => th.textContent
		)

		expect(head).toEqual(['Schema', 'Tables'])
		expect(container.querySelector('[data-graph-design-dialect]')).toBeNull()
	})

	it('renders the note after its first paragraph, which the header already shows', () => {
		const { container } = render(OverviewView, { model: DESIGN })

		expect(container.querySelector('[data-graph-section="notes"]')?.textContent).toContain(
			'place_order'
		)
		expect(container.querySelector('[data-graph-section="notes"]')?.textContent).not.toContain(
			'Storefront'
		)
	})

	it('says so when the design has nothing at all', () => {
		const { container } = render(OverviewView, { model: { tables: [], refs: [] } })

		expect(container.querySelectorAll('[data-graph-design-card]')).toHaveLength(0)
		expect(container.querySelector('[data-graph-design-empty]')?.textContent).toBe(
			'This design has no schemas.'
		)
	})
})
