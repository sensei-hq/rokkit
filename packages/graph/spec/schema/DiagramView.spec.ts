import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { vibe } from '@rokkit/states'
import DiagramView from '../../src/schema/DiagramView.svelte'
import { DESIGN, ER_ONLY } from './design-fixture.js'

const world = (root: HTMLElement) => root.querySelector('[data-graph-world]')

describe('DiagramView', () => {
	afterEach(() => {
		vibe.mode = 'light'
	})

	it('draws the ER half as the ranked flow diagram, named for the design', () => {
		const { container } = render(DiagramView, { model: DESIGN })

		expect(world(container)?.getAttribute('data-graph-layout')).toBe('flow')
		expect(container.querySelector('svg[role="img"]')?.getAttribute('aria-label')).toBe(
			'shopdb entity relationship diagram'
		)
	})

	it('draws the tables and the stubs their keys land on — never a view or routine', () => {
		const { container } = render(DiagramView, { model: DESIGN, density: 'names' })
		const edges = [...container.querySelectorAll('[data-graph-edge]')].map((e) =>
			e.getAttribute('data-edge-to')
		)

		expect(edges).toContain('geo.regions')
		expect(container.querySelector('[data-node-kind="view"]')).toBeNull()
	})

	it('offers the Names | Keys | All detail, the edge style and the zoom', () => {
		const { container } = render(DiagramView, { model: DESIGN })
		const levels = [...container.querySelectorAll('[data-graph-density]')].map((b) =>
			b.textContent?.trim()
		)

		expect(levels).toEqual(['Names', 'Keys', 'All'])
		expect(container.querySelector('[data-graph-edge-style]')).not.toBeNull()
		expect(container.querySelector('[data-graph-zoom-controls]')).not.toBeNull()
	})

	it('keys the schemas in a legend under the canvas', () => {
		const { container } = render(DiagramView, { model: DESIGN })
		const legend = container.querySelector('[data-graph-legend]')?.textContent ?? ''

		expect(legend).toContain('auth')
		expect(legend).toContain('shop')
	})

	it('names an unnamed design plainly', () => {
		const { container } = render(DiagramView, { model: ER_ONLY })

		expect(container.querySelector('svg[role="img"]')?.getAttribute('aria-label')).toBe(
			'Entity relationship diagram'
		)
	})

	it('follows the page mode unless the host sets one', () => {
		const tint = (props: Record<string, unknown>) =>
			render(DiagramView, { model: DESIGN, ...props })
				.container.querySelector('[data-graph-node="auth.users"]')
				?.getAttribute('style')

		const light = tint({ mode: 'light' })
		const dark = tint({ mode: 'dark' })
		vibe.mode = 'dark'
		const followed = tint({})

		expect(dark).not.toBe(light)
		expect(followed).toBe(dark)
	})
})
