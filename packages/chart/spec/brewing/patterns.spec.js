import { describe, it, expect } from 'vitest'
import { PATTERN_ORDER, assignPatterns, patternIdFor } from '../../src/lib/brewing/patterns.js'

describe('PATTERN_ORDER', () => {
	it('starts with diagonal', () => {
		expect(PATTERN_ORDER[0]).toBe('diagonal')
	})

	it('has exactly 21 patterns', () => {
		expect(PATTERN_ORDER).toHaveLength(21)
	})
})

describe('assignPatterns', () => {
	it('assigns patterns in order', () => {
		const values = ['a', 'b', 'c']
		const result = assignPatterns(values)
		expect(result.get('a')).toBe(PATTERN_ORDER[0])
		expect(result.get('b')).toBe(PATTERN_ORDER[1])
		expect(result.get('c')).toBe(PATTERN_ORDER[2])
	})

	it('cycles past the end of PATTERN_ORDER', () => {
		const values = Array.from({ length: PATTERN_ORDER.length + 1 }, (_, i) => `v${i}`)
		const result = assignPatterns(values)
		expect(result.get(`v${PATTERN_ORDER.length}`)).toBe(PATTERN_ORDER[0])
	})

	it('returns a Map', () => {
		const result = assignPatterns(['x', 'y'])
		expect(result).toBeInstanceOf(Map)
	})
})

describe('patternIdFor', () => {
	const patterns = new Map([
		['a b', 'dots'],
		[0, 'hatch']
	])

	it('returns the safe pattern id for a key the patterns map knows', () => {
		expect(patternIdFor('a b', patterns)).toBe('chart-pat-a-b')
		expect(patternIdFor(0, patterns)).toBe('chart-pat-0')
	})

	it('returns null for an unknown, null or undefined key', () => {
		expect(patternIdFor('zzz', patterns)).toBeNull()
		expect(patternIdFor(null, new Map([[null, 'dots']]))).toBeNull()
		expect(patternIdFor(undefined, new Map([[undefined, 'dots']]))).toBeNull()
	})

	it('returns null without a patterns map', () => {
		expect(patternIdFor('a b', undefined)).toBeNull()
	})
})
