import { describe, it, expect } from 'vitest'
import { subBandFields, stackFieldOf, stackLayers } from '../../../src/lib/plot/stacking.js'

describe('subBandFields', () => {
	it('lists distinct non-x fields, group first, skipping literal colours', () => {
		expect(subBandFields({ x: 'q', group: 'g', color: 'c', pattern: 'p' })).toEqual(['g', 'c', 'p'])
		expect(subBandFields({ x: 'q', group: 'q', color: '#f00', pattern: 'p' })).toEqual(['p'])
		expect(subBandFields({ x: 'q', group: 'c', color: 'c' })).toEqual(['c'])
	})
})

describe('stackFieldOf — the one stacking rule', () => {
	it('stacks by group when given', () => {
		expect(stackFieldOf({ x: 'q', group: 'g', fill: 'f' })).toBe('g')
	})
	it('defaults group to the interior, fill before colour', () => {
		expect(stackFieldOf({ x: 'q', fill: 'f', color: 'c' })).toBe('f')
		expect(stackFieldOf({ x: 'q', color: 'c' })).toBe('c')
	})
	it('falls through to the pattern when the colour fields are the x field', () => {
		expect(stackFieldOf({ x: 'q', fill: 'q', pattern: 'p' })).toBe('p')
	})
	it('is null when nothing but x groups the bars — the builder draws plain bars', () => {
		expect(stackFieldOf({ x: 'q', fill: 'q' })).toBeNull()
		expect(stackFieldOf({ x: 'q' })).toBeNull()
	})
})

describe('stackLayers', () => {
	const rows = [
		{ c: 'a', s: 'p', v: 2 },
		{ c: 'a', s: 'q', v: 3 },
		{ c: 'b', s: 'p', v: 4 }
	]

	it('stacks one layer per stack value, one point per x category in the given order', () => {
		const layers = stackLayers(rows, { x: 'c', y: 'v', stackField: 's', xCategories: ['b', 'a'] })
		expect(layers.map((l) => l.key)).toEqual(['p', 'q'])
		expect(layers[0].map((pt) => [pt[0], pt[1], pt.data.c])).toEqual([
			[0, 4, 'b'],
			[0, 2, 'a']
		])
	})

	it('stacks a missing (x, stack) cell as 0', () => {
		const layers = stackLayers(rows, { x: 'c', y: 'v', stackField: 's', xCategories: ['a', 'b'] })
		expect([layers[1][1][0], layers[1][1][1]]).toEqual([4, 4])
	})

	it('normalize expands each column to [0, 1]', () => {
		const layers = stackLayers(rows, {
			x: 'c',
			y: 'v',
			stackField: 's',
			xCategories: ['a'],
			normalize: true
		})
		expect([layers[0][0][1], layers[1][0][1]]).toEqual([0.4, 1])
	})
})
