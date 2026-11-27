import { ascending } from 'd3-array'
import { literalColor, markEntry } from '../colors.js'

/**
 * Deterministic pseudo-random in [0, 1) from a non-negative integer seed.
 * Avoids Math.random so layouts are stable across renders (repo rule).
 *
 * @param {number} n
 * @returns {number}
 */
function hashUnit(n) {
	const x = Math.sin(n + 1) * 43758.5453
	return x - Math.floor(x)
}

/**
 * Places one point per datum within each x-band. Two layouts:
 *  - 'jitter': deterministic horizontal offset seeded by index-in-group.
 *  - 'swarm':  1-D beeswarm — sort by y, dodge horizontally to avoid overlap.
 *
 * @param {Object[]} data - raw rows (stat=identity)
 * @param {{ x?: string, y?: string, fill?: string }} channels
 * @param {{ xScale: Function, yScale: Function, colors?: Map<unknown, {fill:string, stroke:string}>, method?: 'jitter'|'swarm', r?: number, side?: 'left'|'right'|'center' }} opts
 *   `side` confines points to one half of the band (for raincloud/half-plots).
 * @returns {Array<{ cx:number, cy:number, fill:string, stroke:string, data:Record<string, unknown> }>}
 */
export function buildSwarm(data, channels, opts) {
	const { xScale, yScale, colors, method = 'jitter', r = 2, side = 'center' } = opts
	const { x: xf, y: yf, fill: ff } = channels
	// A literal fill colours every point directly; otherwise group on the fill field.
	const lit = literalColor(ff)
	const field = lit ? undefined : ff
	const isBand = typeof xScale.bandwidth === 'function'
	const bw = isBand ? xScale.bandwidth() : 40
	// One-sided layouts get the full half-band on their side; centred straddles ±halfBand.
	const halfBand = (bw / 2) * 0.8 // leave a small gutter

	// Group rows by x value, preserving first-seen order.
	const groups = new Map()
	for (const d of data) {
		const key = d[xf]
		if (!groups.has(key)) groups.set(key, [])
		groups.get(key).push(d)
	}

	const result = []
	for (const [xVal, rows] of groups) {
		// A band scale returns the band's start; a continuous one returns its centre.
		const center = (xScale(xVal) ?? 0) + (isBand ? bw / 2 : 0)
		const offsets =
			method === 'swarm'
				? swarmOffsets(rows, { yf, yScale, r, halfBand, side })
				: rows.map((_, i) => jitterOffset(hashUnit(i), halfBand, side))

		rows.forEach((d, i) => {
			const fillKey = field ? d[field] : xVal
			const colorEntry = markEntry(lit, fillKey, colors, { fill: '#aaa', stroke: '#666' })
			result.push({
				data: d,
				cx: center + offsets[i],
				cy: yScale(d[yf]),
				fill: colorEntry.fill,
				stroke: colorEntry.stroke
			})
		})
	}
	return result
}

// Map a [0,1) hash to a horizontal offset, confined to the requested side.
//  center → [-halfBand, halfBand];  right → [0, halfBand];  left → [-halfBand, 0]
function jitterOffset(u, halfBand, side) {
	if (side === 'right') return u * halfBand
	if (side === 'left') return -u * halfBand
	return (u * 2 - 1) * halfBand
}

/**
 * Computes horizontal offsets for a beeswarm: sort by y, then for each point
 * pick the smallest-magnitude offset that doesn't collide (distance >= 2r) with
 * any already-placed point in the group. When the band is over capacity (more
 * points than fit at 2r spacing), fall back to the least-crowded slot (max
 * separation) so overflow points spread across the band instead of stacking at
 * the center — a best-effort layout, not a hard non-overlap guarantee.
 * `side` confines candidates to one half of the band. Returns offsets in INPUT order.
 *
 * @param {Record<string, unknown>[]} rows
 * @param {{ yf?: string, yScale: Function, r: number, halfBand: number, side?: 'left'|'right'|'center' }} opts
 */
function swarmOffsets(rows, { yf, yScale, r, halfBand, side = 'center' }) {
	const order = rows.map((d, i) => ({ i, cy: yScale(d[yf]) })).sort((a, b) => ascending(a.cy, b.cy))
	const placed = []
	const offsetByIndex = new Array(rows.length).fill(0)
	for (const { i, cy } of order) {
		const offset = dodgeOffset(cy, placed, { r, halfBand, side })
		placed.push({ offset, cy })
		offsetByIndex[i] = offset
	}
	return offsetByIndex
}

/**
 * The k-th candidate offset for a beeswarm point, in order of preference: rightwards only for
 * side='right', leftwards only for side='left', else alternating outwards from the centre
 * (0, +step, -step, +2·step, -2·step, …).
 */
function candidateOffset(k, step, side) {
	if (side === 'right') return k * step
	if (side === 'left') return -k * step
	if (k === 0) return 0
	return (k % 2 === 1 ? 1 : -1) * Math.ceil(k / 2) * step
}

/** Distance from (offset, cy) to the nearest already-placed point; Infinity when none. */
function separation(placed, offset, cy) {
	if (!placed.length) return Infinity
	return Math.min(...placed.map((p) => Math.hypot(offset - p.offset, cy - p.cy)))
}

/**
 * The offset for one point: the first in-band candidate that clears every placed point by 2r.
 * When the band is over capacity (none clears), fall back to the least-crowded slot (max
 * separation) rather than stacking every overflow point at the centre.
 */
function dodgeOffset(cy, placed, { r, halfBand, side }) {
	const step = r / 2
	const kMax = Math.ceil((2 * halfBand) / step)
	let best = { offset: 0, sep: -Infinity }
	for (let k = 0; k <= kMax; k++) {
		const candidate = candidateOffset(k, step, side)
		if (Math.abs(candidate) > halfBand) continue
		const sep = separation(placed, candidate, cy)
		if (sep >= 2 * r) return candidate
		if (sep > best.sep) best = { offset: candidate, sep }
	}
	return best.offset
}
