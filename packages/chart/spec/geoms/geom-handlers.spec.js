import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import { createMockState } from '../helpers/mock-plot-state.js'
import TestArea from '../helpers/TestArea.svelte'
import TestBox from '../helpers/TestBox.svelte'
import TestJitter from '../helpers/TestJitter.svelte'
import TestPoint from '../helpers/TestPoint.svelte'

/**
 * The pointer/keyboard handlers on the marks the existing geom specs render but never
 * touch: Area's tooltip hit-circles, Box's body + outlier hover and texture overlay,
 * Jitter's points, and Point's symbol-path variant.
 */

const all = (container, element) => [
	...container.querySelectorAll(`[data-plot-element="${element}"]`)
]

describe('Area — tooltip hit-circles', () => {
	const rows = [
		{ x: 0, y: 1 },
		{ x: 1, y: 3 }
	]
	const areaState = (overrides = {}) =>
		createMockState({
			xScale: scaleLinear().domain([0, 1]).range([0, 100]),
			yScale: scaleLinear().domain([0, 4]).range([100, 0]),
			geomData: () => rows,
			data: rows,
			setHovered: vi.fn(),
			clearHovered: vi.fn(),
			handleSelect: vi.fn(),
			...overrides
		})

	it('places one hit-circle per row and reports hover / leave', async () => {
		const state = areaState()
		const { container } = render(TestArea, { state })
		const hits = all(container, 'area-hover')
		expect(hits.map((c) => [c.getAttribute('cx'), c.getAttribute('cy')])).toEqual([
			['0', '75'],
			['100', '25']
		])

		await fireEvent.mouseEnter(hits[1])
		expect(state.setHovered).toHaveBeenCalledWith(rows[1])
		await fireEvent.mouseLeave(hits[1])
		expect(state.clearHovered).toHaveBeenCalled()
	})

	it('is presentation-only and ignores keys when the plot is not interactive', async () => {
		const state = areaState({ interactive: false })
		const { container } = render(TestArea, { state })
		const [hit] = all(container, 'area-hover')
		expect(hit.getAttribute('role')).toBe('presentation')
		expect(hit.hasAttribute('tabindex')).toBe(false)
		await fireEvent.keyDown(hit, { key: 'Enter' })
		expect(state.handleSelect).not.toHaveBeenCalled()
	})

	it.each(['Enter', ' '])('%s selects the row when the plot is interactive', async (key) => {
		const state = areaState({ interactive: true })
		const { container } = render(TestArea, { state })
		const [hit] = all(container, 'area-hover')
		expect(hit.getAttribute('role')).toBe('button')
		await fireEvent.keyDown(hit, { key })
		expect(state.handleSelect).toHaveBeenCalledTimes(1)
		expect(state.handleSelect.mock.calls[0][0]).toMatchObject({
			datum: rows[0],
			index: 0,
			geom: 'area'
		})
	})

	it('other keys do not select', async () => {
		const state = areaState({ interactive: true })
		const { container } = render(TestArea, { state })
		await fireEvent.keyDown(all(container, 'area-hover')[0], { key: 'a' })
		expect(state.handleSelect).not.toHaveBeenCalled()
	})
})

describe('Box — body hover, outlier leave, texture overlay', () => {
	const row = { cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 10, iqr_max: 80, outliers: [95] }
	const boxState = (overrides = {}) =>
		createMockState({
			xScale: scaleBand().domain(['A']).range([0, 200]).padding(0.1),
			yScale: scaleLinear().domain([0, 100]).range([200, 0]),
			colors: new Map([['A', { fill: '#4e79a7', stroke: '#264653' }]]),
			geomData: () => [row],
			setHovered: vi.fn(),
			clearHovered: vi.fn(),
			...overrides
		})

	it('reports the box row on body hover and clears on leave', async () => {
		const state = boxState()
		const { container } = render(TestBox, { props: { state, x: 'cat' } })
		const [body] = all(container, 'box-body')
		await fireEvent.mouseEnter(body)
		expect(state.setHovered).toHaveBeenCalledWith(row)
		await fireEvent.mouseLeave(body)
		expect(state.clearHovered).toHaveBeenCalledTimes(1)
	})

	it('clears the hover when leaving an outlier', async () => {
		const state = boxState()
		const { container } = render(TestBox, { props: { state, x: 'cat' } })
		await fireEvent.mouseLeave(all(container, 'box-outlier')[0])
		expect(state.clearHovered).toHaveBeenCalledTimes(1)
	})

	it('draws a pointer-transparent texture rect over the body when the box has a pattern', () => {
		const state = boxState({ patterns: new Map([['A', 'dots']]) })
		const { container } = render(TestBox, {
			props: { state, x: 'cat', fill: 'cat', pattern: 'cat' }
		})
		const [body] = all(container, 'box-body')
		const overlay = container.querySelector('rect[fill="url(#chart-pat-A)"]')
		expect(overlay).toBeTruthy()
		expect(overlay.getAttribute('pointer-events')).toBe('none')
		for (const attr of ['x', 'y', 'width', 'height']) {
			expect(overlay.getAttribute(attr)).toBe(body.getAttribute(attr))
		}
	})

	it('draws no texture rect without a pattern', () => {
		const { container } = render(TestBox, { props: { state: boxState(), x: 'cat' } })
		expect(container.querySelector('rect[fill^="url(#"]')).toBeNull()
	})
})

describe('Jitter — point hover', () => {
	it('reports the hovered row and clears it on leave', async () => {
		const rows = [{ cat: 'A', val: 10 }]
		const state = createMockState({
			xScale: scaleBand().domain(['A']).range([0, 200]),
			yScale: scaleLinear().domain([0, 100]).range([200, 0]),
			geomData: () => rows,
			setHovered: vi.fn(),
			clearHovered: vi.fn()
		})
		const { container } = render(TestJitter, { props: { state } })
		const [pt] = all(container, 'jitter-point')
		expect(pt.getAttribute('aria-label')).toBe('(A, 10)')
		await fireEvent.mouseEnter(pt)
		expect(state.setHovered).toHaveBeenCalledWith(rows[0])
		await fireEvent.mouseLeave(pt)
		expect(state.clearHovered).toHaveBeenCalled()
	})
})

describe('Point — symbol shapes', () => {
	const rows = [
		{ cat: 'a', val: 10, kind: 'sq' },
		{ cat: 'b', val: 20, kind: 'tri' }
	]
	const pointState = (overrides = {}) =>
		createMockState({
			xScale: scaleBand().domain(['a', 'b']).range([0, 300]).padding(0.1),
			yScale: scaleLinear().domain([0, 40]).range([200, 0]),
			geomData: () => rows,
			data: rows,
			symbols: new Map([
				['sq', 'square'],
				['tri', 'triangle']
			]),
			setHovered: vi.fn(),
			clearHovered: vi.fn(),
			handleSelect: vi.fn(),
			...overrides
		})

	it('renders a translated symbol path (not a circle) per point', () => {
		const { container } = render(TestPoint, {
			state: pointState(),
			x: 'cat',
			y: 'val',
			symbol: 'kind'
		})
		const marks = all(container, 'point')
		expect(marks.map((m) => m.tagName.toLowerCase())).toEqual(['path', 'path'])
		expect(marks[0].getAttribute('d')).not.toBe(marks[1].getAttribute('d'))
		expect(marks[0].getAttribute('transform')).toMatch(/^translate\([\d.]+,150\)$/)
		expect(marks[0].getAttribute('aria-label')).toBe('a, 10')
		expect(marks[0].getAttribute('role')).toBe('graphics-symbol')
	})

	it('reports hover / leave from a symbol path', async () => {
		const state = pointState()
		const { container } = render(TestPoint, { state, x: 'cat', y: 'val', symbol: 'kind' })
		const [first] = all(container, 'point')
		await fireEvent.mouseEnter(first)
		expect(state.setHovered).toHaveBeenCalledWith(rows[0])
		await fireEvent.mouseLeave(first)
		expect(state.clearHovered).toHaveBeenCalled()
	})

	it('a symbol path is a button that selects on click, Enter and Space when onselect is set', async () => {
		const onselect = vi.fn()
		const { container } = render(TestPoint, {
			state: pointState(),
			x: 'cat',
			y: 'val',
			symbol: 'kind',
			onselect
		})
		const [first] = all(container, 'point')
		expect(first.getAttribute('role')).toBe('button')
		expect(first.getAttribute('tabindex')).toBe('0')
		await fireEvent.click(first)
		await fireEvent.keyDown(first, { key: 'Enter' })
		await fireEvent.keyDown(first, { key: ' ' })
		await fireEvent.keyDown(first, { key: 'x' })
		expect(onselect).toHaveBeenCalledTimes(3)
		expect(onselect).toHaveBeenCalledWith(rows[0])
	})

	it('an interactive plot receives a select detail from a symbol path', async () => {
		const state = pointState({ interactive: true })
		const { container } = render(TestPoint, { state, x: 'cat', y: 'val', symbol: 'kind' })
		await fireEvent.click(all(container, 'point')[1])
		expect(state.handleSelect).toHaveBeenCalledTimes(1)
		expect(state.handleSelect.mock.calls[0][0]).toMatchObject({
			datum: rows[1],
			index: 1,
			geom: 'point'
		})
	})
})
