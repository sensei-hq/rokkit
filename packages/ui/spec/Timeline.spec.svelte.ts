import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Timeline from '../src/components/Timeline.svelte'

const sampleItems = [
	{ label: 'Step One', description: 'First step description', completed: true },
	{ label: 'Step Two', description: 'Second step description', active: true },
	{ label: 'Step Three', description: 'Third step description' }
]

describe('Timeline', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a timeline container', () => {
		const { container } = render(Timeline, { items: sampleItems })
		expect(container.querySelector('[data-timeline]')).toBeTruthy()
	})

	it('renders timeline items', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items.length).toBe(3)
	})

	it('renders circles with step numbers', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const circles = container.querySelectorAll('[data-timeline-circle]')
		expect(circles.length).toBe(3)
		// First is completed (shows icon), second and third show numbers
		expect(circles[2].textContent?.trim()).toBe('3')
	})

	it('renders connector lines except on last item', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const connectors = container.querySelectorAll('[data-timeline-connector]')
		expect(connectors.length).toBe(2) // 3 items, 2 connectors
	})

	it('renders no connector on single item', () => {
		const { container } = render(Timeline, { items: [{ label: 'Only' }] })
		const connectors = container.querySelectorAll('[data-timeline-connector]')
		expect(connectors.length).toBe(0)
	})

	// ─── Title and Description ──────────────────────────────────────

	it('renders title text', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const titles = container.querySelectorAll('[data-timeline-title]')
		expect(titles[0].textContent).toBe('Step One')
		expect(titles[1].textContent).toBe('Step Two')
		expect(titles[2].textContent).toBe('Step Three')
	})

	it('renders description text', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const descriptions = container.querySelectorAll('[data-timeline-description]')
		expect(descriptions[0].textContent).toBe('First step description')
	})

	it('does not render description when not provided', () => {
		const { container } = render(Timeline, { items: [{ label: 'No desc' }] })
		const descriptions = container.querySelectorAll('[data-timeline-description]')
		expect(descriptions.length).toBe(0)
	})

	// ─── States ─────────────────────────────────────────────────────

	it('applies completed state', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items[0].hasAttribute('data-completed')).toBe(true)
		expect(items[1].hasAttribute('data-completed')).toBe(false)
	})

	it('applies active state', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items[1].hasAttribute('data-active')).toBe(true)
		expect(items[0].hasAttribute('data-active')).toBe(false)
	})

	it('shows check icon for completed items', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const circles = container.querySelectorAll('[data-timeline-circle]')
		// Completed circle should contain an icon span
		const icon = circles[0].querySelector('span')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('i-lucide:check')).toBe(true)
	})

	it('shows step number for non-completed items', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const circles = container.querySelectorAll('[data-timeline-circle]')
		// Active (not completed) shows number
		expect(circles[1].textContent?.trim()).toBe('2')
	})

	// ─── Icon support ───────────────────────────────────────────────

	it('shows icon in circle when provided', () => {
		const items = [{ label: 'With icon', icon: 'i-lucide:star' }]
		const { container } = render(Timeline, { items })
		const circle = container.querySelector('[data-timeline-circle]')
		const icon = circle?.querySelector('span')
		expect(icon?.classList.contains('i-lucide:star')).toBe(true)
	})

	// ─── Field mapping ──────────────────────────────────────────────

	it('supports field mapping', () => {
		const items = [{ title: 'Mapped', summary: 'Mapped desc' }]
		const fields = { label: 'title', subtext: 'summary' }
		const { container } = render(Timeline, { items, fields })
		expect(container.querySelector('[data-timeline-title]')?.textContent).toBe('Mapped')
		expect(container.querySelector('[data-timeline-description]')?.textContent).toBe('Mapped desc')
	})

	// ─── Empty state ────────────────────────────────────────────────

	it('renders empty when no items', () => {
		const { container } = render(Timeline, { items: [] })
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items.length).toBe(0)
	})

	it('renders empty by default (no items prop)', () => {
		const { container } = render(Timeline)
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items.length).toBe(0)
	})

	// ─── CSS class ──────────────────────────────────────────────────

	it('applies custom CSS class', () => {
		const { container } = render(Timeline, { items: sampleItems, class: 'my-timeline' })
		expect(container.querySelector('[data-timeline]')?.classList.contains('my-timeline')).toBe(true)
	})

	// ─── ARIA ───────────────────────────────────────────────────────

	it('has role="list" on container', () => {
		const { container } = render(Timeline, { items: sampleItems })
		expect(container.querySelector('[data-timeline]')?.getAttribute('role')).toBe('list')
	})

	it('has role="listitem" on items', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const items = container.querySelectorAll('[data-timeline-item]')
		items.forEach((item) => {
			expect(item.getAttribute('role')).toBe('listitem')
		})
	})

	it('has aria-hidden on markers', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const markers = container.querySelectorAll('[data-timeline-marker]')
		markers.forEach((marker) => {
			expect(marker.getAttribute('aria-hidden')).toBe('true')
		})
	})

	// ─── Tone ───────────────────────────────────────────────────────

	it('reads each item in its tone', () => {
		const items = [{ label: 'Merged', tone: 'success' }, { label: 'Asked', tone: 'warning' }, { label: 'Plain' }]
		const { container } = render(Timeline, { items })
		const rows = container.querySelectorAll('[data-timeline-item]')
		expect(rows[0].getAttribute('data-tone')).toBe('success')
		expect(rows[1].getAttribute('data-tone')).toBe('warning')
		expect(rows[2].hasAttribute('data-tone')).toBe(false)
	})

	it('maps the tone field', () => {
		const items = [{ label: 'Lost', outcome: 'danger' }]
		const { container } = render(Timeline, { items, fields: { tone: 'outcome' } })
		expect(container.querySelector('[data-timeline-item]')?.getAttribute('data-tone')).toBe('danger')
	})

	// ─── Dot marker ─────────────────────────────────────────────────

	it('draws a plain dot for each item when marker is dot: no number, no icon', () => {
		const items = [{ label: 'One', completed: true }, { label: 'Two', icon: 'i-lucide:star' }, { label: 'Three' }]
		const { container } = render(Timeline, { items, marker: 'dot' })
		expect(container.querySelector('[data-timeline]')?.getAttribute('data-marker')).toBe('dot')
		const circles = container.querySelectorAll('[data-timeline-circle]')
		expect(circles.length).toBe(3)
		circles.forEach((c) => {
			expect(c.textContent?.trim()).toBe('')
			expect(c.querySelector('span')).toBeNull()
		})
	})

	it('numbers its steps by default (no marker attribute)', () => {
		const { container } = render(Timeline, { items: sampleItems })
		expect(container.querySelector('[data-timeline]')?.hasAttribute('data-marker')).toBe(false)
	})

	// ─── Custom icons ───────────────────────────────────────────────

	it('supports custom completed icon', () => {
		const items = [{ label: 'Done', completed: true }]
		const icons = { completed: 'i-lucide:circle-check' }
		const { container } = render(Timeline, { items, icons })
		const circle = container.querySelector('[data-timeline-circle]')
		const icon = circle?.querySelector('span')
		expect(icon?.classList.contains('i-lucide:circle-check')).toBe(true)
	})
})
