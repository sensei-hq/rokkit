import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildBars, buildStackedBars } from '../../../src/geoms/lib/bars.js'

/**
 * Characterization of the fallback branches in geoms/lib/bars.js that the feature specs
 * never reach: scales that return undefined, continuous rows without `_entity`, literal
 * colors on a stacked chart, sparse stack cells, and color/pattern channels keyed on x.
 */

/** A linear scale that answers `undefined` for one sentinel value, like a scale fed junk. */
function holeyScale(base, hole) {
	const s = (v) => (v === hole ? undefined : base(v))
	s.range = () => base.range()
	s.domain = () => base.domain()
	return s
}

const band = scaleBand().domain(['a', 'b']).range([0, 100])
const value = scaleLinear().domain([0, 10]).range([100, 0])

describe('buildBars — fallbacks', () => {
	it('continuous mode: an unplaceable position starts the bar at 0', () => {
		const rank = holeyScale(scaleLinear().domain([0, 2]).range([0, 200]), 1)
		const bars = buildBars(
			[
				{ r: 0, v: 5 },
				{ r: 1, v: 5 }
			],
			{ x: 'r', y: 'v' },
			{ xScale: rank, yScale: value, continuousCategory: true }
		)
		// thickness = 0.9 * step(100) = 90 → the unplaced bar is centred on 0
		expect(bars[1].x).toBe(-45)
		expect(bars[0].x).toBe(-45)
		expect(bars.map((b) => b.width)).toEqual([90, 90])
	})

	it('continuous mode: keys fall back to the x value and an empty color when no _entity / color', () => {
		const rank = scaleLinear().domain([0, 2]).range([0, 200])
		const bars = buildBars(
			[{ r: 0, v: 5 }],
			{ x: 'r', y: 'v' },
			{ xScale: rank, yScale: value, continuousCategory: true }
		)
		expect(bars[0].key).toBe('0::')
		expect(bars[0].fill).toBe('#888')
	})

	it('baseline falls back to the range origin when yScale(0) is undefined', () => {
		const y = holeyScale(scaleLinear().domain([-10, 10]).range([100, 0]), 0)
		const bars = buildBars([{ c: 'a', v: 5 }], { x: 'c', y: 'v' }, { xScale: band, yScale: y })
		// baseline = range()[0] = 100, top = y(5) = 25
		expect(bars[0].y).toBe(25)
		expect(bars[0].height).toBe(75)
	})

	it('a value yScale cannot place collapses onto the baseline', () => {
		const y = holeyScale(value, 7)
		const bars = buildBars([{ c: 'a', v: 7 }], { x: 'c', y: 'v' }, { xScale: band, yScale: y })
		expect(bars[0].height).toBe(0)
	})
})

describe('buildStackedBars — fallbacks and key routing', () => {
	const data = [
		{ c: 'a', s: 'p', v: 2 },
		{ c: 'a', s: 'q', v: 3 },
		{ c: 'b', s: 'p', v: 4 }
	]

	it('a literal color paints every stacked segment directly', () => {
		const bars = buildStackedBars(
			data,
			{ x: 'c', y: 'v', color: '#123456', group: 's' },
			{ xScale: band, yScale: value, colors: new Map() }
		)
		expect(bars.every((b) => b.fill === '#123456' && b.stroke === '#123456')).toBe(true)
	})

	it('a missing (x, stack) cell stacks as a zero-height segment', () => {
		const bars = buildStackedBars(
			data,
			{ x: 'c', y: 'v', color: 's' },
			{ xScale: band, yScale: value, colors: new Map() }
		)
		const bq = bars.find((b) => b.key === 'b::q')
		expect(bq.height).toBe(0)
	})

	it('color keyed on x looks up the x value; pattern keyed on x looks up the x value', () => {
		const colors = new Map([
			['a', { fill: 'red', stroke: 'darkred' }],
			['b', { fill: 'blue', stroke: 'darkblue' }]
		])
		const patterns = new Map([['b', 'dots']])
		const bars = buildStackedBars(
			data,
			{ x: 'c', y: 'v', color: 'c', pattern: 'c', group: 's' },
			{ xScale: band, yScale: value, colors, patterns }
		)
		expect(bars.find((b) => b.key === 'a::p').fill).toBe('red')
		expect(bars.find((b) => b.key === 'b::p').fill).toBe('blue')
		expect(bars.find((b) => b.key === 'a::p').patternId).toBeNull()
		expect(bars.find((b) => b.key === 'b::p').patternId).not.toBeNull()
	})

	it('color/pattern on a third field (neither x nor the stack field) fall back to defaults', () => {
		const rows = data.map((d) => ({ ...d, t: 'z' }))
		const bars = buildStackedBars(
			rows,
			{ x: 'c', y: 'v', color: 't', pattern: 't', group: 's' },
			{
				xScale: band,
				yScale: value,
				colors: new Map([['z', { fill: 'green', stroke: 'g' }]]),
				patterns: new Map([['z', 'dots']])
			}
		)
		// The stack dimension is `group` (s), so a color/pattern on `t` matches neither x nor
		// the stack key: no lookup happens and the defaults apply.
		expect(bars.map((b) => b.fill)).toEqual(['#888', '#888', '#888', '#888'])
		expect(bars.every((b) => b.patternId === null)).toBe(true)
	})
})
