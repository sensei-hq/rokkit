import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
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

describe('StatCard — marks, descriptions and states', () => {
	it('draws a text mark (a kanji) when it has no icon', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Failing', value: 2, mark: '難' }
		})
		const mark = part(container, 'mark') as HTMLElement

		expect(mark.textContent).toBe('難')
		expect(mark.getAttribute('aria-hidden')).toBe('true')
		expect(part(container, 'icon')).toBeNull()
	})

	it('prefers the icon over the text mark when it has both', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Failing', value: 2, mark: '難', icon: 'i-glyph:bug' }
		})

		expect(part(container, 'icon')?.className).toBe('i-glyph:bug')
		expect(part(container, 'mark')).toBeNull()
	})

	it('renders a mark snippet in the head', () => {
		const mark = createRawSnippet(() => ({ render: () => '<b data-custom-mark>★</b>' }))
		const { container } = render(StatCardTest, { props: { label: 'Stars', value: 5, mark } })

		expect(part(container, 'head')?.querySelector('[data-custom-mark]')?.textContent).toBe('★')
	})

	it('shows a description under the value', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Needs you', value: 1, description: 'Only you can turn it on' }
		})
		const card = container.querySelector('[data-stat-card]') as HTMLElement

		expect(part(container, 'description')?.textContent).toBe('Only you can turn it on')
		expect(card.lastElementChild?.matches('[data-stat-card-description]')).toBe(true)
	})

	it('keeps the two-line description space when asked, even without a description', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Dōjōs', value: 3, reserveDescription: true }
		})
		const description = part(container, 'description') as HTMLElement

		expect(description).not.toBeNull()
		expect(description.textContent).toBe('')
		expect(description.getAttribute('aria-hidden')).toBe('true')
	})

	it('is a plain, non-interactive frame without href or onclick', () => {
		const { container } = render(StatCardTest, { props: { label: 'Dōjōs', value: 3 } })
		const card = container.querySelector('[data-stat-card]') as HTMLElement

		expect(card.tagName).toBe('DIV')
		expect(card.hasAttribute('data-stat-card-interactive')).toBe(false)
		expect(card.hasAttribute('aria-pressed')).toBe(false)
	})

	it('is a button that reports pressed when it has an onclick', async () => {
		const onclick = vi.fn()
		const { container } = render(StatCardTest, {
			props: { label: 'Failing', value: 2, onclick, pressed: true }
		})
		const card = container.querySelector('[data-stat-card]') as HTMLButtonElement

		expect(card.tagName).toBe('BUTTON')
		expect(card.type).toBe('button')
		expect(card.getAttribute('aria-pressed')).toBe('true')
		expect(card.hasAttribute('data-stat-card-interactive')).toBe(true)
		await fireEvent.click(card)
		expect(onclick).toHaveBeenCalledTimes(1)
	})

	it('reports not pressed when interactive and not pressed', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Failing', value: 2, onclick: () => {} }
		})

		expect(container.querySelector('[data-stat-card]')?.getAttribute('aria-pressed')).toBe('false')
	})

	it('marks a linked card interactive, the value still the link', () => {
		const { container } = render(StatCardTest, {
			props: { label: 'Cycles', value: 4, href: '/cycles' }
		})
		const card = container.querySelector('[data-stat-card]') as HTMLElement

		expect(card.tagName).toBe('DIV')
		expect(card.hasAttribute('data-stat-card-interactive')).toBe(true)
		expect(part(container, 'value')?.tagName).toBe('A')
	})

	it('spans the grid columns it is given', () => {
		const { container } = render(StatCardTest, { props: { label: 'Edges', value: 3, span: 2 } })
		const card = container.querySelector('[data-stat-card]') as HTMLElement

		expect(card.getAttribute('data-span')).toBe('2')
		expect(card.style.getPropertyValue('--stat-card-span')).toBe('2')
	})

	it('accepts the ink tone as the plain tone', () => {
		const { container } = render(StatCardTest, { props: { label: 'Edges', value: 3, tone: 'ink' } })

		expect(container.querySelector('[data-stat-card]')?.getAttribute('data-tone')).toBe('ink')
	})
})
