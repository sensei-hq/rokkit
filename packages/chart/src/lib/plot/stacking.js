import { stack, stackOffsetExpand } from 'd3-shape'
import { isLiteralColor } from '../brewing/colors.js'

/**
 * d3 stack layers for long-format rows: one layer per distinct `stackField` value (first-seen
 * order), one point per entry of `xCategories` (in that order). A missing (x, stack) cell
 * stacks as 0 so every layer stays continuous; `normalize` expands each column to [0, 1]
 * (position='fill').
 *
 * @param {Record<string, unknown>[]} data
 * @param {{ x: string, y: string, stackField: string, xCategories: unknown[], normalize?: boolean }} opts
 */
export function stackLayers(data, { x, y, stackField, xCategories, normalize = false }) {
	const stackCategories = [...new Set(data.map((d) => d[stackField]))]
	const lookup = new Map()
	for (const d of data) {
		if (!lookup.has(d[x])) lookup.set(d[x], {})
		lookup.get(d[x])[d[stackField]] = Number(d[y])
	}
	const wide = xCategories.map((xVal) => {
		const row = { [x]: xVal }
		for (const key of stackCategories) row[key] = lookup.get(xVal)?.[key] ?? 0
		return row
	})
	const gen = stack().keys(stackCategories)
	if (normalize) gen.offset(stackOffsetExpand)
	return gen(wide)
}

/**
 * The distinct non-x fields among [group, color, pattern] — the fields that put more than one
 * bar in a single x band (dodge) or more than one segment in a column (stack). `group`, the
 * explicit grouping channel, comes first. Literal colours are paint, not fields.
 *
 * @param {{ x?: string, group?: string, color?: string, pattern?: string }} channels
 * @returns {string[]}
 */
export function subBandFields(channels) {
	const { x: xf, group: gf, color: cf, pattern: pf } = channels
	const out = []
	for (const f of [gf, cf, pf]) {
		if (f && f !== xf && !out.includes(f) && !isLiteralColor(f)) out.push(f)
	}
	return out
}

/**
 * The field a stacked bar stacks by, from a bar's own channels — or null when there is none,
 * in which case the builder draws plain bars. One rule for the builder that draws the stack
 * and the domain that sizes the axis to it: two copies disagreed, and the axis ended below
 * the tallest bar.
 *
 * `group` defaults to the interior (`fill ?? color`), exactly as the bar marks resolve it.
 *
 * @param {{ x?: string, group?: string, fill?: string, color?: string, pattern?: string }} channels
 * @returns {string | null}
 */
export function stackFieldOf({ x, group, fill, color, pattern }) {
	const interior = fill ?? color
	return subBandFields({ x, group: group ?? interior, color: interior, pattern })[0] ?? null
}
