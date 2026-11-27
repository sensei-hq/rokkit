import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { buildAreaMarks } from '../../src/geoms/lib/marks/area.js'
import { buildHexbinMarks } from '../../src/geoms/lib/marks/hexbin.js'
import { defaultPreset } from '../../src/lib/preset.js'

/**
 * Characterization of the mark adapters' less-travelled branches: the legacy
 * `options.stack` flag and a bordered stacked area (no groupKey) for buildAreaMarks, and
 * missing x/y channels for buildHexbinMarks.
 */

const data = [
	{ t: 0, v: 10, region: 'North' },
	{ t: 1, v: 20, region: 'North' },
	{ t: 0, v: 5, region: 'South' },
	{ t: 1, v: 8, region: 'South' }
]

function fakePlot(colors) {
	return {
		xScale: scaleLinear().domain([0, 1]).range([0, 100]),
		yScale: scaleLinear().domain([0, 40]).range([100, 0]),
		colors,
		patterns: new Map(),
		chartPreset: defaultPreset,
		place: (x, y) => ({ x, y })
	}
}

describe('buildAreaMarks — legacy stack flag and stacked border', () => {
	const colors = new Map([
		['North', { fill: 'lightblue', stroke: 'darkblue' }],
		['South', { fill: 'lightred', stroke: 'darkred' }]
	])

	it('options.stack: true stacks the areas (same output as position: "stack")', () => {
		const channels = { x: 't', y: 'v', fill: 'region' }
		const legacy = buildAreaMarks({ data, plot: fakePlot(colors), channels, options: { stack: true } })
		const explicit = buildAreaMarks({ data, plot: fakePlot(colors), channels, options: { position: 'stack' } })
		expect(legacy).toEqual(explicit)
		expect(legacy.every((s) => s.groupKey === undefined)).toBe(true)
	})

	it('a bordered stacked area looks its stroke up by the segment key', () => {
		const segs = buildAreaMarks({
			data,
			plot: fakePlot(colors),
			channels: { x: 't', y: 'v', fill: 'region', color: 'region' },
			options: { position: 'stack' }
		})
		expect(segs.map((s) => s.stroke)).toEqual(['darkblue', 'darkred'])
	})

	it('a bordered area whose group is missing from the colors map gets no stroke', () => {
		const segs = buildAreaMarks({
			data,
			plot: fakePlot(new Map([['North', { fill: 'lightblue', stroke: 'darkblue' }]])),
			channels: { x: 't', y: 'v', fill: 'region', color: 'region' }
		})
		expect(segs.map((s) => s.stroke)).toEqual(['darkblue', 'none'])
	})
})

describe('buildHexbinMarks — missing channels', () => {
	it('reads the empty-string field when x/y channels are absent', () => {
		const plot = {
			xScale: (v) => (v === undefined ? 0 : 50),
			yScale: (v) => (v === undefined ? 0 : 50),
			continuousColorScale: null,
			chartPreset: defaultPreset
		}
		const hexes = buildHexbinMarks({ data: [{ '': 1 }, { '': 2 }], plot, channels: {} })
		expect(hexes).toHaveLength(1)
		expect(hexes[0].count).toBe(2)
		expect(hexes[0].cx).not.toBe(0)
	})
})
