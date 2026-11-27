/**
 * Converts a data key to a safe SVG element ID for pattern references.
 * Spaces and non-word characters are replaced to avoid broken url(#...) refs.
 * @param {unknown} key
 * @returns {string}
 */
export function toPatternId(key) {
	return `chart-pat-${String(key)
		.replace(/\s+/g, '-')
		.replace(/[^\w-]/g, '_')}`
}

/**
 * The pattern id for one mark's pattern-channel value, or null for a solid fill: a null /
 * undefined value, or one the `patterns` map has no pattern for, is not textured.
 * @param {unknown} key
 * @param {Map<unknown, string> | undefined | null} patterns
 * @returns {string | null}
 */
export function patternIdFor(key, patterns) {
	if (key === null || key === undefined || !patterns?.has(key)) return null
	return toPatternId(String(key))
}

// Keys must match the keys in packages/chart/src/patterns/patterns.js
export const PATTERN_ORDER = [
	'diagonal',
	'dots',
	'triangles',
	'hatch',
	'lattice',
	'swell',
	'checkerboard',
	'waves',
	'petals',
	'brick',
	'diamonds',
	'tile',
	'scales',
	'circles',
	'pip',
	'rings',
	'chevrons',
	'shards',
	'wedge',
	'argyle',
	'shell'
]

/**
 * Assigns patterns from PATTERN_ORDER to an array of distinct values.
 * @param {unknown[]} values
 * @returns {Map<unknown, string>}
 */
export function assignPatterns(values) {
	return new Map(values.map((v, i) => [v, PATTERN_ORDER[i % PATTERN_ORDER.length]]))
}
