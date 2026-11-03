import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import StatCardTest from './StatCardTest.svelte'

const part = (root: HTMLElement, name: string) => root.querySelector(`[data-stat-card-${name}]`)

describe('StatCard', () => {
	it('puts the icon and the label on top, and the value below them', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Tables', value: 198, icon: 'i-glyph:table' }
		})
		const card = container.querySelector('[data-stat-card]') as HTMLElement
		const [head, value] = [...card.children] as HTMLElement[]

		expect(head.matches('[data-stat-card-head]')).toBe(true)
		expect(part(head, 'icon')?.className).toBe('i-glyph:table')
		expect(part(head, 'label')?.textContent).toBe('Tables')
		expect(value.matches('[data-stat-card-value]')).toBe(true)
		expect(value.textContent).toBe('198')
	})

	it('shows a value given as text unchanged', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Same layer · down', value: '12 · 30' }
		})

		expect(part(container, 'value')?.textContent).toBe('12 · 30')
	})

	it('draws no icon when it has none', () => {
		const { container } = render(StatCardTest, { props: { label: 'Edges', value: 3 } })

		expect(part(container, 'icon')).toBeNull()
	})

	it('wears its tone, and none when it has no tone', () => {
		const toned = render(StatCardTest, { props: { label: 'Upward', value: 4, tone: 'danger' } })
		const plain = render(StatCardTest, { props: { label: 'Edges', value: 3 } })

		expect(toned.container.querySelector('[data-stat-card]')?.getAttribute('data-tone')).toBe(
			'danger'
		)
		expect(plain.container.querySelector('[data-stat-card]')?.hasAttribute('data-tone')).toBe(false)
	})

	it('links its value when it has somewhere to go', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Cycles', value: 4, href: '/diagrams/cycles' }
		})
		const value = part(container, 'value') as HTMLAnchorElement

		expect(value.tagName).toBe('A')
		expect(value.getAttribute('href')).toBe('/diagrams/cycles')
	})

	it('passes its class through', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Edges', value: 3, class: 'wide' }
		})

		expect(container.querySelector('[data-stat-card]')?.classList.contains('wide')).toBe(true)
	})
})
