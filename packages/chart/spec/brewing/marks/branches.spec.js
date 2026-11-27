import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildBoxes } from '../../../src/lib/brewing/marks/boxes.js'
import { buildPoints } from '../../../src/lib/brewing/marks/points.js'
import { buildSwarm } from '../../../src/lib/brewing/marks/swarm.js'
import { buildViolins } from '../../../src/lib/brewing/marks/violins.js'

/**
 * Characterization of the brewing mark builders' non-band and fallback branches: a linear
 * (non-band) x scale, a grouped box with an explicit width, a symbol value the symbol map
 * lacks, and the left-sided beeswarm.
 */

const linearX = scaleLinear().domain([0, 10]).range([0, 100])
const yScale = scaleLinear().domain([0, 100]).range([100, 0])
const stat = { q1: 25, median: 50, q3: 75, iqr_min: 10, iqr_max: 90 }

describe('buildBoxes — non-band and grouped width', () => {
	it('a linear x scale uses a 20px default band, centred on the x position', () => {
		const [box] = buildBoxes(
			[{ x: 5, ...stat }],
			{ x: 'x' },
			{ xScale: linearX, yScale, colors: new Map() }
		)
		expect(box.cx).toBe(50)
		expect(box.width).toBe(12)
		expect(box.whiskerWidth).toBe(6)
	})

	it('a grouped box with an explicit width sizes from the sub-band', () => {
		const xBand = scaleBand().domain(['a']).range([0, 100])
		const boxes = buildBoxes(
			[
				{ x: 'a', g: 'p', ...stat },
				{ x: 'a', g: 'q', ...stat }
			],
			{ x: 'x', fill: 'g' },
			{ xScale: xBand, yScale, colors: new Map(), width: 0.5 }
		)
		// sub-band = 50 → box = 25, whisker = 25 * 0.53
		expect(boxes.map((b) => b.width)).toEqual([25, 25])
		expect(boxes[0].whiskerWidth).toBeCloseTo(13.25)
		expect(boxes.map((b) => b.cx)).toEqual([25, 75])
	})
})

describe('buildPoints — symbol map miss', () => {
	it('falls back to a circle when the symbol value is not in the map', () => {
		const [withMiss] = buildPoints(
			[{ x: 1, y: 1, s: 'unknown' }],
			{ x: 'x', y: 'y', symbol: 's' },
			{
				xScale: linearX,
				yScale,
				colors: new Map(),
				sizeScale: null,
				symbolMap: new Map([['known', 'square']]),
				defaultRadius: 4
			}
		)
		const [circle] = buildPoints(
			[{ x: 1, y: 1, s: 'known' }],
			{ x: 'x', y: 'y', symbol: 's' },
			{
				xScale: linearX,
				yScale,
				colors: new Map(),
				sizeScale: null,
				symbolMap: new Map([['known', 'circle']]),
				defaultRadius: 4
			}
		)
		expect(withMiss.symbolPath).toBe(circle.symbolPath)
	})
})

describe('buildSwarm — non-band and left swarm', () => {
	it('a linear x scale centres a 40px band on the x position', () => {
		const pts = buildSwarm(
			[
				{ x: 5, y: 10 },
				{ x: 5, y: 10 }
			],
			{ x: 'x', y: 'y' },
			{ xScale: linearX, yScale, colors: new Map(), method: 'swarm', r: 2 }
		)
		// centre = 50; the second identical point dodges right by 2r
		expect(pts.map((p) => p.cx)).toEqual([50, 54])
		expect(pts[0].fill).toBe('#aaa')
	})

	it('a linear x scale that cannot place a value centres the band at 0', () => {
		const holey = (v) => (v === 'nope' ? undefined : linearX(v))
		const [p] = buildSwarm(
			[{ x: 'nope', y: 10 }],
			{ x: 'x', y: 'y' },
			{ xScale: holey, yScale, colors: new Map(), method: 'swarm' }
		)
		expect(p.cx).toBe(0)
	})

	it('a band scale that does not know the category starts its band at 0', () => {
		const xBand = scaleBand().domain(['a']).range([100, 200])
		const [p] = buildSwarm(
			[{ x: 'zzz', y: 10 }],
			{ x: 'x', y: 'y' },
			{ xScale: xBand, yScale, colors: new Map(), method: 'swarm' }
		)
		expect(p.cx).toBe(50)
	})

	it('side=left swarm dodges leftwards only', () => {
		const xBand = scaleBand().domain(['a']).range([0, 100])
		const pts = buildSwarm(
			[
				{ x: 'a', y: 10 },
				{ x: 'a', y: 10 },
				{ x: 'a', y: 10 }
			],
			{ x: 'x', y: 'y' },
			{ xScale: xBand, yScale, colors: new Map(), method: 'swarm', r: 2, side: 'left' }
		)
		expect(pts.map((p) => p.cx)).toEqual([50, 46, 42])
	})
})

describe('buildViolins — non-band', () => {
	it('a linear x scale uses a 40px band centred on the x position', () => {
		const [v] = buildViolins(
			[{ x: 5, ...stat }],
			{ x: 'x' },
			{ xScale: linearX, yScale, colors: new Map() }
		)
		expect(v.cx).toBe(50)
		expect(v.fill).toBe('#aaa')
		expect(v.d).toMatch(/^M51.44,10C/)
	})
})
