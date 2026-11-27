/* Column typing for the /chat data-upload demo: what type each cell reads as, and a summary
 * of each column (type, density, numeric range) the shape inference chooses a view from.
 */

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'unknown'

export type FieldSummary = {
	name: string
	type: FieldType
	/** % of non-null values (0..1) */
	density: number
	/** for numeric fields: min / max */
	min?: number
	max?: number
}

// ─── Type detection ─────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/
const NUMERIC_STRING_RE = /^-?\d+(\.\d+)?$/

export function isNumericString(value: string): boolean {
	return NUMERIC_STRING_RE.test(value)
}

function isEmptyValue(value: unknown): boolean {
	return value === null || value === undefined || value === ''
}

function detectStringType(value: string): FieldType {
	if (DATE_RE.test(value)) return 'date'
	if (isNumericString(value)) return 'number'
	if (value === 'true' || value === 'false') return 'boolean'
	return 'string'
}

export function detectType(value: unknown): FieldType {
	if (isEmptyValue(value)) return 'unknown'
	if (typeof value === 'boolean') return 'boolean'
	if (typeof value === 'number') return Number.isFinite(value) ? 'number' : 'unknown'
	if (typeof value === 'string') return detectStringType(value)
	return 'unknown'
}

function coalesceTypes(types: FieldType[]): FieldType {
	const set = new Set(types.filter((t) => t !== 'unknown'))
	if (set.size === 0) return 'unknown'
	if (set.size === 1) return [...set][0]
	// mixed → fall back to string
	return 'string'
}

/** Min/max across a column's numeric cells, or null when it has none. */
function numericRange(
	rows: Record<string, unknown>[],
	name: string
): { min: number; max: number } | null {
	let min = Infinity
	let max = -Infinity
	for (const row of rows) {
		const v = row[name]
		if (detectType(v) !== 'number') continue
		const n = typeof v === 'number' ? v : Number(v)
		if (n < min) min = n
		if (n > max) max = n
	}
	return min === Infinity ? null : { min, max }
}

export function summarizeColumn(rows: Record<string, unknown>[], name: string): FieldSummary {
	const types: FieldType[] = rows.map((row) => detectType(row[name]))
	const nonNull = types.filter((t) => t !== 'unknown').length
	const type = coalesceTypes(types)
	const summary: FieldSummary = {
		name,
		type,
		density: rows.length === 0 ? 0 : nonNull / rows.length
	}
	const range = type === 'number' ? numericRange(rows, name) : null
	if (range) Object.assign(summary, range)
	return summary
}
