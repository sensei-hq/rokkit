import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import ScreenInfo from '../src/components/ScreenInfo.svelte'

const framing = { label: 'About', kanji: '道', icon: 'i-solar:map', title: 'The relay', text: 'Lanes hand work on.' }
const howTo = {
	label: 'How it works',
	steps: [
		{ kanji: '一', icon: 'i-solar:one', title: 'Plan', text: 'Write the items.' },
		{ kanji: '二', title: 'Run' }
	]
}
const stat = { label: 'Done', value: 3, total: 5, progress: 0.6 }

describe('ScreenInfo', () => {
	it('draws at most three columns on the role wash, passing other attributes through', () => {
		const { container } = render(ScreenInfo, {
			columns: [framing, howTo, stat, { label: 'Fourth' }],
			role: 'success',
			class: 'band',
			id: 'info'
		})
		const band = container.querySelector('[data-screen-info]')!
		expect(band.getAttribute('data-role')).toBe('success')
		expect(band.getAttribute('class')).toBe('band')
		expect(band.id).toBe('info')
		expect(band.querySelectorAll('[data-screen-info-column]')).toHaveLength(3)
	})

	it('defaults to the accent wash and no class', () => {
		const { container } = render(ScreenInfo, { columns: [{ label: 'Only' }] })
		const band = container.querySelector('[data-screen-info]')!
		expect(band.getAttribute('data-role')).toBe('accent')
		expect(band.hasAttribute('class')).toBe(false)
	})

	it('the framing column: eyebrow, the kanji mark by default, title and lead', () => {
		const { container } = render(ScreenInfo, { columns: [framing] })
		expect(container.querySelector('[data-screen-info-label]')?.textContent).toBe('About')
		expect(container.querySelector('[data-screen-info-mark]')?.textContent).toBe('道')
		expect(container.querySelector('[data-screen-info-title]')?.textContent).toBe('The relay')
		expect(container.querySelector('[data-screen-info-text]')?.textContent).toBe('Lanes hand work on.')
	})

	it('icon glyphs draw the icon class; a step with no icon keeps its kanji', () => {
		const { container } = render(ScreenInfo, { columns: [framing, howTo], glyphs: 'icon' })
		const mark = container.querySelector('[data-screen-info-mark]')!
		expect(mark.getAttribute('class')).toBe('i-solar:map')
		expect(mark.textContent).toBe('')
		const steps = container.querySelectorAll('[data-screen-info-step-mark]')
		expect(steps[0].getAttribute('class')).toBe('i-solar:one')
		expect(steps[1].textContent).toBe('二')
	})

	it('the how-to column: each step with its title, and its text only when given', () => {
		const { container } = render(ScreenInfo, { columns: [howTo] })
		const steps = container.querySelectorAll('[data-screen-info-step]')
		expect(steps).toHaveLength(2)
		expect(steps[0].querySelector('[data-screen-info-step-title]')?.textContent).toBe('Plan')
		expect(steps[0].querySelector('[data-screen-info-step-text]')?.textContent).toBe('Write the items.')
		expect(steps[1].querySelector('[data-screen-info-step-text]')).toBeNull()
	})

	it('the stat column: value over total, and a meter filled to the progress', () => {
		const { container } = render(ScreenInfo, { columns: [stat] })
		expect(container.querySelector('[data-screen-info-value]')?.textContent).toBe('3')
		expect(container.querySelector('[data-screen-info-total]')?.textContent).toBe('/ 5')
		const meter = container.querySelector('[role="meter"]')!
		expect(meter.getAttribute('aria-label')).toBe('Done')
		expect(meter.getAttribute('aria-valuenow')).toBe('0.6')
		const fill = container.querySelector('[data-screen-info-meter-fill]') as HTMLElement
		expect(fill.style.inlineSize).toBe('60%')
	})

	it('a meter clamps progress outside 0–1; a value alone has no total', () => {
		const { container } = render(ScreenInfo, {
			columns: [
				{ label: 'Over', value: 9, progress: 1.4 },
				{ label: 'Under', progress: -0.2 }
			]
		})
		const fills = container.querySelectorAll('[data-screen-info-meter-fill]') as NodeListOf<HTMLElement>
		expect(fills[0].style.inlineSize).toBe('100%')
		expect(fills[1].style.inlineSize).toBe('0%')
		expect(container.querySelector('[data-screen-info-total]')).toBeNull()
	})

	it('a bare column draws its eyebrow only: no heading, figure, meter, steps or lead', () => {
		const { container } = render(ScreenInfo, { columns: [{ label: 'Bare', steps: [] }] })
		for (const part of ['heading', 'figure', 'meter', 'steps', 'text']) {
			expect(container.querySelector(`[data-screen-info-${part}]`)).toBeNull()
		}
	})

	it('a heading with a title but no mark draws no mark', () => {
		const { container } = render(ScreenInfo, { columns: [{ label: 'L', title: 'T' }] })
		expect(container.querySelector('[data-screen-info-heading]')).not.toBeNull()
		expect(container.querySelector('[data-screen-info-mark]')).toBeNull()
	})

	it('a snippet column is drawn inside the column frame', () => {
		const custom = createRawSnippet(() => ({ render: () => '<em data-custom>mine</em>' }))
		const { container } = render(ScreenInfo, { columns: [custom] })
		const col = container.querySelector('[data-screen-info-column]')!
		expect(col.querySelector('[data-custom]')?.textContent).toBe('mine')
		expect(col.querySelector('[data-screen-info-label]')).toBeNull()
	})
})
