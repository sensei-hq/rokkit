import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import DesignHead from '../../src/schema/DesignHead.svelte'

describe('DesignHead', () => {
	it('names the object with its schema as the lead-in, and carries no badges when given none', () => {
		const { container } = render(DesignHead, { schema: 'shop', name: 'orders' })
		expect(container.querySelector('[data-graph-design-schema]')?.textContent).toBe('shop.')
		expect(container.querySelector('[data-graph-design-title]')?.textContent).toBe('orders')
		expect(container.querySelectorAll('[data-graph-design-badge]')).toHaveLength(0)
	})

	it('lists its badges in order', () => {
		const { container } = render(DesignHead, {
			schema: 'shop',
			name: 'orders',
			badges: ['5 columns', '1 out · 1 in']
		})
		expect(
			[...container.querySelectorAll('[data-graph-design-badge]')].map((b) => b.textContent)
		).toEqual(['5 columns', '1 out · 1 in'])
	})
})
