import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { buildAreas, buildStackedAreas } from '../../../src/geoms/lib/areas.js'

/**
 * Characterization of the fallback branches in geoms/lib/areas.js that the feature specs
 * never reach: no colors map, no patterns map, a pattern channel with an empty patterns map,
 * incomparable x values, and sparse (missing) stack cells.
 */

const xScale = scaleLinear().domain([0, 2]).range([0, 200])
const yScale = scaleLinear().domain([0, 10]).range([100, 0])

describe('buildAreas — fallbacks', () => {
	it('falls back to #888 when no colors map is given (single series)', () => {
		const [seg] = buildAreas(
			[
				{ x: 0, y: 1 },
				{ x: 1, y: 2 }
			],
			{ x: 'x', y: 'y' },
			{ xScale, yScale }
		)
		expect(seg.fill).toBe('#888')
		expect(seg.patternId).toBeNull()
	})

	it('falls back to #888 when the colors map is empty (single series)', () => {
		const [seg] = buildAreas(
			[{ x: 0, y: 1 }],
			{ x: 'x', y: 'y' },
			{ xScale, yScale, colors: new Map() }
		)
		expect(seg.fill).toBe('#888')
	})

	it('assigns no pattern when the pattern field differs from color and no patterns map is given', () => {
		const segs = buildAreas(
			[
				{ x: 0, y: 1, g: 'a', p: 'dots' },
				{ x: 1, y: 2, g: 'b', p: 'lines' }
			],
			{ x: 'x', y: 'y', color: 'g', pattern: 'p' },
			{ xScale, yScale, colors: new Map() }
		)
		expect(segs.map((s) => s.patternId)).toEqual([null, null])
		expect(segs.map((s) => s.fill)).toEqual(['#888', '#888'])
	})
})

describe('buildStackedAreas — fallbacks', () => {
	it('fills a missing (x, series) cell with 0 so the stack stays continuous', () => {
		const segs = buildStackedAreas(
			[
				{ x: 0, y: 2, g: 'a' },
				{ x: 1, y: 3, g: 'a' },
				{ x: 1, y: 4, g: 'b' }
			],
			{ x: 'x', y: 'y', color: 'g' },
			{ xScale, yScale, colors: new Map() }
		)
		expect(segs.map((s) => s.key)).toEqual(['a', 'b'])
		// 'b' has no row at x=0: its band there is [2, 2] (zero thickness on top of 'a').
		expect(segs[1].d).toBe('M0,80L100,30L100,70L0,80Z')
	})

	it('keeps first-seen order for x values that do not compare (NaN)', () => {
		const segs = buildStackedAreas(
			[
				{ x: NaN, y: 1, g: 'a' },
				{ x: 1, y: 2, g: 'a' }
			],
			{ x: 'x', y: 'y', color: 'g' },
			{ xScale, yScale, colors: new Map() }
		)
		expect(segs).toHaveLength(1)
		expect(segs[0].d).toContain('NaN')
	})

	it('assigns no pattern when the pattern field differs from color and no patterns map is given', () => {
		const segs = buildStackedAreas(
			[
				{ x: 0, y: 1, g: 'a', p: 'dots' },
				{ x: 1, y: 2, g: 'b', p: 'lines' }
			],
			{ x: 'x', y: 'y', color: 'g', pattern: 'p' },
			{ xScale, yScale }
		)
		expect(segs.map((s) => s.patternId)).toEqual([null, null])
		expect(segs.map((s) => s.fill)).toEqual(['#888', '#888'])
	})
})
