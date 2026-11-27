import { area, curveCatmullRom, curveStep } from 'd3-shape'
import { patternIdFor } from '../../lib/brewing/patterns.js'
import { literalColor, markEntry } from '../../lib/brewing/colors.js'
import { stackLayers } from '../../lib/plot/stacking.js'

/**
 * @typedef {Object} AreaOptions
 * @property {Function} xScale
 * @property {Function} yScale
 * @property {Map<unknown, {fill: string, stroke: string}>} [colors]
 * @property {'linear'|'smooth'|'step'} [curve]
 * @property {Map<unknown, string>} [patterns]
 * @property {(x: number, y: number) => {x: number, y: number}} [place] - orientation mapper
 */

const GREY = { fill: '#888', stroke: '#888' }
const CURVES = { smooth: curveCatmullRom, step: curveStep }
/** `sign` clamps an area's top edge to one side of the baseline (see `buildAreas`). */
const CLAMP = { above: Math.min, below: Math.max }

const identityPlace = (/** @type {number} */ x, /** @type {number} */ y) => ({ x, y })
const isNil = (/** @type {unknown} */ v) => v === undefined || v === null

/** Sort comparator for raw x values; incomparable pairs (NaN, mixed types) keep their order. */
const compareLoose = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/** Screen position of `v`: a band's centre, or the raw position on a continuous scale. */
function bandCenter(xScale, v) {
	return typeof xScale.bandwidth === 'function' ? xScale(v) + xScale.bandwidth() / 2 : xScale(v)
}

/** d3 area generator over `{ base, top }` edge points, with the requested curve. */
function edgeArea(curve) {
	const gen = area()
		.x0((p) => p.base.x)
		.y0((p) => p.base.y)
		.x1((p) => p.top.x)
		.y1((p) => p.top.y)
	if (CURVES[curve]) gen.curve(CURVES[curve])
	return gen
}

/**
 * The pattern key for the i-th group. With no pattern channel, or one on the color field
 * itself, the group key is the pattern key; a pattern on a different field is assigned
 * positionally so each area gets a distinct pattern.
 */
function groupPatternKey(key, i, { pf, cf, patterns }) {
	if (!pf || pf === cf) return key
	const ordered = [...(patterns?.keys() ?? [])]
	return ordered[i % ordered.length] ?? null
}

/**
 * @typedef {Object} AreaGeometry
 * @property {Function} xScale
 * @property {Function} yScale
 * @property {string} xf - x field
 * @property {string} yf - y field
 * @property {(x: number, y: number) => {x: number, y: number}} place
 * @property {number} baseline - pixel position the fill is anchored at
 * @property {boolean} hasBaseline - whether an explicit baseline value splits the fill by sign
 * @property {'linear'|'smooth'|'step'} [curve]
 */

/**
 * One area edge point (baseline + top), placed so the area transposes under orientation.
 * `sign` clamps the top edge to one side of the baseline — 'above' never dips below it,
 * 'below' never rises above it — the same technique proven in Sparkline (#148). This MUST
 * happen here, in value space, before `place()` runs: `place` is how horizontal/flipped
 * orientation is implemented (it can swap x/y), so clamping the post-place coordinate would
 * clamp whatever axis ends up there — including the category axis on a flipped chart. `v`
 * carries the raw y-value so the generator can break the area at a gap (null).
 *
 * @param {Record<string, unknown>} d
 * @param {AreaGeometry} geo
 * @param {'above'|'below'} [sign]
 */
function areaEdge(d, { xScale, yScale, xf, yf, place, baseline }, sign) {
	const rawTop = yScale(d[yf])
	const top = CLAMP[sign] ? CLAMP[sign](rawTop, baseline) : rawTop
	const x = bandCenter(xScale, d[xf])
	return { base: place(x, baseline), top: place(x, top), v: d[yf] }
}

/**
 * The area path through `rows`. A null y-value is a GAP (a missing period): the area breaks
 * there instead of dropping onto the 0 baseline. A genuine 0 stays defined and fills.
 *
 * @param {Record<string, unknown>[]} rows
 * @param {AreaGeometry} geo
 * @param {'above'|'below'} [sign]
 */
function areaPath(rows, geo, sign) {
	const defined = (p) => Number.isFinite(p.top.y) && (isNil(geo.yf) || !isNil(p.v))
	return edgeArea(geo.curve).defined(defined)(rows.map((d) => areaEdge(d, geo, sign)))
}

/**
 * One unsigned segment normally; with a baseline, an above and a below copy so themes can
 * colour positive vs negative fill independently. Mirrors the approach proven in Sparkline
 * (#148). Also owns the "no baseline" `d` computation so both call sites just hand over rows.
 *
 * Only the genuinely ungrouped case (no color/fill channel at all) may use a bare sign as the
 * key — there's exactly one segment set in that case, so 'above'/'below' are already unique. A
 * grouped segment must ALWAYS get a discriminated key, even when its group's value happens to
 * be null/undefined: that's a real, distinct group, not "no grouping" — collapsing the two onto
 * the same bare key is exactly the bug this branches around. `typeof` alone already keeps null
 * (typeof 'object') and undefined (typeof 'undefined') apart, no extra special-casing needed
 * for them. This assumes group values are primitives (string/number/boolean/null/undefined),
 * true for every color/fill channel today; two distinct objects (or two Dates with equal
 * timestamps) stringifying to the same "type:value" could still collide — an accepted,
 * documented bound, not an oversight.
 *
 * @param {Object} segBase - the segment's shared fields (fill, stroke, key, groupKey, patternId)
 * @param {Record<string, unknown>[]} rows - already sorted by x
 * @param {AreaGeometry} geo
 * @param {boolean} grouped
 */
function splitBySign(segBase, rows, geo, grouped) {
	if (!geo.hasBaseline) return [{ ...segBase, d: areaPath(rows, geo) }]
	return ['above', 'below'].map((sign) => ({
		...segBase,
		d: areaPath(rows, geo, sign),
		sign,
		key: grouped ? `${typeof segBase.key}:${segBase.key}::${sign}` : sign
	}))
}

/**
 * Rows sorted so the path draws left-to-right: by domain index on a band (categorical) x
 * scale, preserving the intended ordering; by value on a continuous one.
 *
 * @param {Record<string, unknown>[]} rows
 * @param {Function} xScale
 * @param {string} xf
 */
function sortByX(rows, xScale, xf) {
	if (typeof xScale.bandwidth !== 'function')
		return [...rows].sort((a, b) => compareLoose(a[xf], b[xf]))
	const domain = xScale.domain()
	return [...rows].sort((a, b) => domain.indexOf(a[xf]) - domain.indexOf(b[xf]))
}

/**
 * Rows bucketed by `field`, in first-seen order.
 * @param {Record<string, unknown>[]} data
 * @param {string} field
 * @returns {Map<unknown, Record<string, unknown>[]>}
 */
function groupBy(data, field) {
	const groups = new Map()
	for (const d of data) {
		const key = d[field]
		if (!groups.has(key)) groups.set(key, [])
		groups.get(key).push(d)
	}
	return groups
}

/**
 * Builds area path geometry for multi-series area charts.
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string, pattern?: string }} channels
 * @param {AreaOptions & { baseline?: number }} opts
 *   `baseline` is the data-space value to anchor/split the fill at. When set, each segment is
 *   emitted twice (sign: 'above' | 'below'), both anchored at this value's pixel position
 *   instead of the chart bottom, so themes can colour the two independently. Fed straight into
 *   `yScale()`, so a value outside the scale's domain extrapolates (e.g. 100 against a domain of
 *   [-5, 5] gives pixel -475) rather than clamping to the chart edge.
 * @returns {{ d: string, fill: string, stroke: string, key: unknown, groupKey: unknown, patternId: string|null, sign?: 'above'|'below' }[]}
 */
export function buildAreas(data, channels, opts) {
	const { xScale, yScale, colors, curve, patterns, place = identityPlace } = opts
	const { x: xf, y: yf, pattern: pf } = channels
	// A literal color (var()/oklch()/hex/currentColor) isn't a data field — it's the exact
	// fill the caller wants for THIS area. Don't group on it, and don't fall back to the
	// shared color scale (one value across all geoms); use it directly.
	const lit = literalColor(channels.color)
	const cf = lit ? undefined : channels.color
	// Number.isFinite (not a loose !=null check) also rejects NaN/Infinity — a caller-computed
	// stat (e.g. a mean over an empty group) can easily produce NaN, which would otherwise sail
	// through and emit literal "NaN" path commands.
	const hasBaseline = Number.isFinite(opts.baseline)
	// Bottom of the chart (y pixel max) unless an explicit baseline value is given.
	const baseline = hasBaseline ? yScale(opts.baseline) : yScale.range()[0]
	/** @type {AreaGeometry} */
	const geo = { xScale, yScale, xf, yf, place, baseline, hasBaseline, curve }

	if (!cf) {
		// A literal color IS the fill; a single-series field uses the shared shade.
		const entry = markEntry(lit, undefined, colors, colors?.values().next().value ?? GREY)
		const patternId = patternIdFor(pf ? data[0]?.[pf] : null, patterns)
		// `groupKey` is the untouched, unsigned group discriminator (here always null): callers
		// that need to look a segment back up in a colors/patterns Map (keyed by the raw group
		// value, not by our render key) should use this instead of `key`, since `key` gets a
		// sign suffix once a baseline is in effect.
		const seg = { fill: entry.fill, stroke: 'none', key: null, groupKey: null, patternId }
		return splitBySign(seg, sortByX(data, xScale, xf), geo, false)
	}

	return [...groupBy(data, cf).entries()].flatMap(([key, rows], i) => {
		const fill = (colors?.get(key) ?? GREY).fill
		const patternId = patternIdFor(groupPatternKey(key, i, { pf, cf, patterns }), patterns)
		const seg = { fill, stroke: 'none', key, groupKey: key, patternId }
		return splitBySign(seg, sortByX(rows, xScale, xf), geo, true)
	})
}

/**
 * Builds stacked area paths using d3 stack layout.
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string, pattern?: string }} channels
 * @param {AreaOptions & { normalize?: boolean }} opts
 *   `normalize` expands each x column to [0, 1] (position='fill', a 100% stacked area).
 * @returns {{ d: string, fill: string, stroke: string, key: unknown, patternId: string|null }[]}
 */
export function buildStackedAreas(data, channels, opts) {
	const { xScale, yScale, colors, curve, patterns, place = identityPlace, normalize = false } = opts
	const { x: xf, y: yf, color: cf, pattern: pf } = channels
	if (!cf) return buildAreas(data, channels, { xScale, yScale, colors, curve, patterns })

	const xCategories = [...new Set(data.map((d) => d[xf]))].sort(compareLoose)
	const layers = stackLayers(data, { x: xf, y: yf, stackField: cf, xCategories, normalize })

	const toEdge = (d) => {
		const x = bandCenter(xScale, d.data[xf])
		return { base: place(x, yScale(d[0])), top: place(x, yScale(d[1])) }
	}

	return layers.map((layer, i) => {
		const colorKey = layer.key
		const entry = colors?.get(colorKey) ?? GREY
		return {
			d: edgeArea(curve)(layer.map(toEdge)) ?? '',
			fill: entry.fill,
			stroke: 'none',
			key: colorKey,
			patternId: patternIdFor(groupPatternKey(colorKey, i, { pf, cf, patterns }), patterns)
		}
	})
}
