import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ContentHeader from '../../src/schema/ContentHeader.svelte'
import { DESIGN, ER_ONLY } from './design-fixture.js'

const tabs = (root: HTMLElement) =>
	[...root.querySelectorAll('[data-tabs-trigger]')].map((t) => t.textContent?.trim())

describe('ContentHeader', () => {
	it('names the design, badges its dialect and states its counts', () => {
		const { container } = render(ContentHeader, { model: DESIGN })

		expect(container.querySelector('[data-graph-design-title]')?.textContent).toBe('shopdb')
		expect(container.querySelector('[data-graph-design-dialect]')?.textContent).toBe('postgresql')
		expect(container.querySelector('[data-graph-design-stats]')?.textContent).toBe(
			'6 tables · 1 enum · 6 refs'
		)
	})

	it("shows the note's first paragraph as the subtitle", () => {
		const { container } = render(ContentHeader, { model: DESIGN })

		expect(container.querySelector('[data-graph-design-lead]')?.textContent).toBe(
			'Storefront catalog, customers and orders.'
		)
	})

	it('offers Overview, Diagram and Entities — never a changelog unless the host adds one', () => {
		const { container } = render(ContentHeader, { model: DESIGN })

		expect(tabs(container)).toEqual(['Overview', 'Diagram', 'Entities'])
	})

	it('takes a host-supplied tab list, so a changelog can be added later', () => {
		const { container } = render(ContentHeader, {
			model: DESIGN,
			tabs: [
				{ value: 'overview', label: 'Overview' },
				{ value: 'changelog', label: 'Changelog' }
			]
		})

		expect(tabs(container)).toEqual(['Overview', 'Changelog'])
	})

	it('reports the tab the reader picks', async () => {
		const onchange = vi.fn()
		const { container } = render(ContentHeader, { model: DESIGN, onchange })

		const diagram = [...container.querySelectorAll('[data-tabs-trigger]')][1] as HTMLElement
		await fireEvent.click(diagram)

		expect(onchange).toHaveBeenCalledWith('diagram')
	})

	it('marks the active tab', () => {
		const { container } = render(ContentHeader, { model: DESIGN, value: 'entities' })

		expect(container.querySelector('[data-tabs-trigger][data-selected]')?.textContent?.trim()).toBe(
			'Entities'
		)
	})

	it('takes the name from the host when the model has no project block, and claims no dialect', () => {
		const { container } = render(ContentHeader, { model: ER_ONLY, name: 'sensei' })

		expect(container.querySelector('[data-graph-design-title]')?.textContent).toBe('sensei')
		expect(container.querySelector('[data-graph-design-dialect]')).toBeNull()
		expect(container.querySelector('[data-graph-design-lead]')).toBeNull()
		expect(container.querySelector('[data-graph-design-stats]')?.textContent).toBe(
			'6 tables · 6 refs'
		)
	})
})
