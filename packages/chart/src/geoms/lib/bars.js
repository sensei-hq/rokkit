import { scaleBand } from 'd3-scale'
import { patternIdFor } from '../../lib/brewing/patterns.js'
import { literalColor, markEntry } from '../../lib/brewing/colors.js'
import { subBandFields, stackLayers } from '../../lib/plot/stacking.js'

/**
 * @typedef {Object} BarOptions
 * @property {Function} xScale - category scale (band, or linear for a numeric/continuous x)
 * @property {Function} yScale - value scale
 * @property {Map<unknown, {fill: string, stroke: string}>} [colors]
 * @property {Map<unknown, string>} [patterns]
 * @property {(x: number, y: number) => {x: number, y: number}} [place] - orientation mapper
 */

/** @typedef {{ position: (d: Record<string, unknown>) => number, thickness: () => number }} BarSlot */

const GREY = { fill: '#888', stroke: '#888' }
const identityPlace = (/** @type {number} */ x, /** @type {number} */ y) => ({ x, y })

/**
 * Returns a band scale suitable for bar x-positioning.
 * When xScale is already a band scale, returns it unchanged.
 * When xScale is a linear scale (numeric x field like year/month),
 * derives a band scale from the distinct values in the data.
 */
function ensureBandX(xScale, data, xField) {
	if (typeof xScale?.bandwidth === 'function') return xScale
	const [r0, r1] = xScale.range()
	const domain = [...new Set(data.map((d) => d[xField]))]
	return scaleBand().domain(domain).range([r0, r1]).padding(0.2)
}

/**
 * Continuous category slots: each bar centres on `xScale(pos)` with a fixed thickness from the
 * scale step, so a fractional position tweens smoothly (a band scale can only jump between slots).
 * @returns {BarSlot}
 */
function continuousSlot(xScale, xf) {
	const [r0, r1] = xScale.range()
	const [d0, d1] = xScale.domain()
	const step = Math.max(Math.abs(r0 - r1) / Math.max(d1 - d0, 1), 1)
	const thickness = step * 0.9
	return {
		thickness: () => thickness,
		position: (d) => (xScale(Number(d[xf])) ?? 0) - thickness / 2
	}
}

/**
 * Band category slots: a scaleBand slots each category; sub-bands split grouped series when
 * more than one sub-key is present.
 * @returns {BarSlot}
 */
function bandSlot(xScale, data, xf, subKeyOf) {
	const bandScale = ensureBandX(xScale, data, xf)
	const subDomain = [...new Set(data.map(subKeyOf))]
	if (subDomain.length <= 1) {
		return { thickness: () => bandScale.bandwidth(), position: (d) => bandScale(d[xf]) ?? 0 }
	}
	const subScale = scaleBand().domain(subDomain).range([0, bandScale.bandwidth()]).padding(0.05)
	return {
		thickness: () => subScale.bandwidth(),
		position: (d) => (bandScale(d[xf]) ?? 0) + (subScale(subKeyOf(d)) ?? 0)
	}
}

/**
 * Value baseline: at value=0 when the domain spans zero (supports negative bars), else the
 * value-axis origin (yScale.range()[0] — innerHeight when vertical, 0 when flipped).
 */
function valueBaseline(yScale) {
	const origin = yScale.range()[0]
	const yDomain = typeof yScale.bandwidth !== 'function' ? yScale.domain?.() : null
	const spansZero = yDomain && yDomain[0] <= 0 && yDomain[yDomain.length - 1] >= 0
	return spansZero ? (yScale(0) ?? origin) : origin
}

/** The screen rectangle spanned by two opposite (placed) corners. */
function rectBetween(c1, c2) {
	return {
		x: Math.min(c1.x, c2.x),
		y: Math.min(c1.y, c2.y),
		width: Math.abs(c2.x - c1.x),
		height: Math.abs(c2.y - c1.y)
	}
}

/**
 * The value a color/pattern channel takes on one stacked segment: its column's x value when
 * the channel is the x field, its layer's stack value when it is the stack field, else null.
 */
function segmentKey(field, { xf, xVal, stackField, stackKey }) {
	if (!field) return null
	if (field === xf) return xVal
	return field === stackField ? stackKey : null
}

/**
 * The one bar builder. Expresses each bar in abstract (category, value) space and maps it to
 * screen via `place()`, so it renders vertical or horizontal (flip) with the same code.
 *
 * Category (x) positioning has two modes:
 * - band (default): a scaleBand slots each category; sub-bands split grouped series.
 * - continuous (`continuousCategory`): a LINEAR position scale (e.g. a bar-chart race's tweened
 *   `_rank`). Each bar centres on `xScale(pos)` with a fixed thickness from the scale step, so a
 *   fractional position tweens smoothly (a band scale can only jump between slots). No sub-banding.
 *
 * @param {Record<string, unknown>[]} data
 * @param {{ x?: string, y?: string, color?: string, pattern?: string, group?: string }} channels
 * @param {BarOptions & { continuousCategory?: boolean, dodge?: boolean }} opts
 *   `dodge: false` (position='identity') overlaps the bars instead of sub-banding them.
 */
export function buildBars(data, channels, opts) {
	const { xScale, yScale, colors, patterns, place = identityPlace } = opts
	const { continuousCategory = false, dodge = true } = opts
	const { x: xf, y: yf, color: cf, pattern: pf } = channels
	// A literal color is the exact fill for every bar; a field indexes the shared color scale.
	const lit = literalColor(cf)
	const field = lit ? undefined : cf

	// No sub-banding for a continuous (race) axis or position='identity' (dodge=false → overlap).
	const subFields = continuousCategory || !dodge ? [] : subBandFields(channels)
	const subKeyOf = (d) => subFields.map((f) => String(d[f])).join('::')
	const slot = continuousCategory
		? continuousSlot(xScale, xf)
		: bandSlot(xScale, data, xf, subKeyOf)
	const baseline = valueBaseline(yScale)
	const fallback = colors?.values().next().value ?? GREY

	return data.map((d, i) => {
		const colorKey = field ? d[field] : null
		const colorEntry = markEntry(lit, colorKey, colors, fallback)
		const band = slot.position(d)
		// Two opposite corners in (band, value) space, placed to screen — transposes under flip.
		const c1 = place(band, baseline)
		const c2 = place(band + slot.thickness(), yScale(d[yf]) ?? baseline)
		// Continuous mode keys by _entity so Svelte reuses each bar as its position tweens (a
		// race's rows reorder every frame); band mode keys by category + sub-band + index.
		const key = continuousCategory
			? `${String(d._entity ?? d[xf])}::${String(colorKey ?? '')}`
			: `${String(d[xf])}::${subKeyOf(d)}::${i}`

		return {
			data: d,
			key,
			...rectBetween(c1, c2),
			fill: colorEntry.fill,
			stroke: colorEntry.stroke,
			patternId: patternIdFor(pf ? d[pf] : null, patterns)
		}
	})
}

/**
 * Stacked bars: one segment per (x category, stack value), stacked along the value axis. The
 * stack dimension is the first non-x grouping field (group, then color, then pattern); with
 * none, plain bars are drawn.
 *
 * @param {Record<string, unknown>[]} data
 * @param {{ x?: string, y?: string, color?: string, pattern?: string, group?: string }} channels
 * @param {BarOptions & { normalize?: boolean }} opts
 *   `normalize` expands each x column to [0, 1] (position='fill', a 100% stack).
 */
export function buildStackedBars(data, channels, opts) {
	const { xScale, yScale, colors, patterns, place = identityPlace, normalize = false } = opts
	const { x: xf, y: yf, color: cf, pattern: pf } = channels
	const subFields = subBandFields(channels)
	if (subFields.length === 0)
		return buildBars(data, channels, { xScale, yScale, colors, patterns, place })

	const stackField = subFields[0]
	const lit = literalColor(cf)
	const field = lit ? undefined : cf
	const bandScale = ensureBandX(xScale, data, xf)
	const xCategories = [...new Set(data.map((d) => d[xf]))]
	const layers = stackLayers(data, { x: xf, y: yf, stackField, xCategories, normalize })

	return layers.flatMap((layer) =>
		layer.map((point) => {
			const xVal = point.data[xf]
			const seg = { xf, xVal, stackField, stackKey: layer.key }
			const colorEntry = markEntry(lit, segmentKey(field, seg), colors, GREY)
			// Two opposite corners in (band, value) space, mapped through place() so the
			// stack transposes under orientation='horizontal' (identity default → unchanged).
			// Without this a grouped stack/fill ignored place() and always drew vertically.
			const band = bandScale(xVal) ?? 0
			const c1 = place(band, yScale(point[0]))
			const c2 = place(band + bandScale.bandwidth(), yScale(point[1]))
			return {
				data: point.data,
				key: `${String(xVal)}::${String(layer.key)}`,
				...rectBetween(c1, c2),
				fill: colorEntry.fill,
				stroke: colorEntry.stroke,
				patternId: patternIdFor(segmentKey(pf, seg), patterns)
			}
		})
	)
}
