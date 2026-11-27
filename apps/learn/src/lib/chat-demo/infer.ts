/**
 * Data → shape inference for the /chat data-upload demo.
 *
 * Given a parsed value (CSV → rows[], JSON → any), pick the best inline
 * rendering:
 *
 *   - single object        → editable form (schema auto-derived from fields)
 *   - array of records     → table (columns inferred from first row)
 *   - numeric series       → bar chart (x = categorical, y = numeric)
 *   - flat array           → list
 *   - other                → JSON code block as fallback
 *
 * The inference is intentionally simple — the goal is "show me something
 * useful from this data without me telling you the schema". An LLM with
 * the full DemoTool catalog can do better; this is the heuristic baseline.
 */

import { detectType, summarizeColumn, type FieldSummary } from './columns'
import { parseCSV } from './csv'

export { detectType, type FieldSummary, type FieldType } from './columns'
export { parseCSV } from './csv'

export type Inference =
	| { kind: 'record'; fields: FieldSummary[]; record: Record<string, unknown> }
	| { kind: 'table'; columns: FieldSummary[]; rows: Record<string, unknown>[] }
	| {
			kind: 'chart'
			columns: FieldSummary[]
			rows: Record<string, unknown>[]
			x: string
			y: string
			fill?: string
	  }
	| { kind: 'list'; items: unknown[] }
	| { kind: 'json'; value: unknown }
	| { kind: 'error'; message: string }

// ─── Shape inference ────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function inferChartAxes(columns: FieldSummary[]): { x: string; y: string; fill?: string } | null {
	const categorical = columns.find((c) => c.type === 'string' || c.type === 'date')
	const numeric = columns.find((c) => c.type === 'number')
	if (!categorical || !numeric) return null
	const secondCategorical = columns.find(
		(c) => c !== categorical && (c.type === 'string' || c.type === 'date')
	)
	const out: { x: string; y: string; fill?: string } = {
		x: categorical.name,
		y: numeric.name
	}
	if (secondCategorical) out.fill = secondCategorical.name
	return out
}

/** Summarize every column of an array of records (union of all keys seen). */
function summarizeRows(rows: Record<string, unknown>[]): FieldSummary[] {
	const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
	return keys.map((k) => summarizeColumn(rows, k))
}

/** Field summary for each key of a single record (density is always 1 — the key is present). */
function buildRecordFields(value: Record<string, unknown>): FieldSummary[] {
	return Object.keys(value).map((k) => ({
		name: k,
		type: detectType(value[k]),
		density: 1
	}))
}

/**
 * Optional hint to override the auto-detection. If `force` is provided and
 * the data can plausibly fit that shape, we return that shape; otherwise we
 * fall back to the normal inference. Used by data-aware suggestions
 * ("Show as a table", "Chart Y by X").
 */
/** The value as an array of plain records, or null when it isn't one. */
const asRecordArray = (value: unknown) =>
	Array.isArray(value) && value.every(isPlainObject) ? (value as Record<string, unknown>[]) : null

/**
 * One builder per forced shape. Each returns an Inference when the data can
 * plausibly fit, or null to fall through to auto-detection — which is what made
 * the original's `chart` branch fall out of its own `if` block without
 * returning.
 */
const FORCED_SHAPES: Record<string, (value: unknown) => Inference | null> = {
	table: (value) => {
		const rows = asRecordArray(value)
		return rows ? { kind: 'table', columns: summarizeRows(rows), rows } : null
	},
	chart: (value) => {
		const rows = asRecordArray(value)
		if (!rows) return null
		const columns = summarizeRows(rows)
		const axes = inferChartAxes(columns)
		return axes ? { kind: 'chart', columns, rows, ...axes } : null
	},
	list: (value) => (Array.isArray(value) ? { kind: 'list', items: value } : null),
	record: (value) =>
		isPlainObject(value)
			? { kind: 'record', fields: buildRecordFields(value), record: value }
			: null
}

export function inferShape(
	value: unknown,
	force?: 'table' | 'chart' | 'record' | 'list'
): Inference {
	const forced = force && Object.hasOwn(FORCED_SHAPES, force) ? FORCED_SHAPES[force](value) : null
	return forced ?? inferShapeAuto(value)
}

/**
 * Array of records → chart when there's a clean (categorical, numeric) pair
 * and the data isn't too big to plot legibly; otherwise a table. Array of
 * primitives (or empty) → list.
 */
function inferArrayShape(value: unknown[]): Inference {
	if (value.length === 0) return { kind: 'list', items: [] }
	if (!value.every(isPlainObject)) return { kind: 'list', items: value }
	const rows = value as Record<string, unknown>[]
	const columns = summarizeRows(rows)
	const axes = inferChartAxes(columns)
	// Chart if we have a clean (categorical, numeric) pair AND not too many
	// rows (charts get crowded). Threshold is conservative; user can always
	// ask for "show as a table" via prose later.
	if (axes && rows.length <= 60 && columns.length <= 4) {
		return { kind: 'chart', columns, rows, ...axes }
	}
	return { kind: 'table', columns, rows }
}

export function inferShapeAuto(value: unknown): Inference {
	// 1. Array of records → table or chart
	if (Array.isArray(value)) return inferArrayShape(value)
	// 2. Single object → editable form
	if (isPlainObject(value)) {
		return { kind: 'record', fields: buildRecordFields(value), record: value }
	}
	return { kind: 'json', value }
}

// ─── Schema generation from a single record ─────────────────────────────

/**
 * Build a JSON-Schema-ish object from a single record so FormRenderer can
 * present an editable view of arbitrary user data.
 */
export function schemaFromRecord(record: Record<string, unknown>): Record<string, unknown> {
	const properties: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(record)) {
		const t = detectType(value)
		if (t === 'number') properties[key] = { type: 'number' }
		else if (t === 'boolean') properties[key] = { type: 'boolean' }
		else if (t === 'date') properties[key] = { type: 'string', format: 'date' }
		else properties[key] = { type: 'string' }
	}
	return { type: 'object', properties }
}

// ─── Try-parse: JSON or CSV ─────────────────────────────────────────────

type ParseResult = { ok: true; value: unknown; format: 'json' | 'csv' } | { ok: false; error: string }

function tryParseJson(trimmed: string): ParseResult {
	try {
		return { ok: true, value: JSON.parse(trimmed), format: 'json' }
	} catch (e) {
		return { ok: false, error: `Invalid JSON: ${(e as Error).message}` }
	}
}

function tryParseCsv(trimmed: string): ParseResult {
	try {
		const rows = parseCSV(trimmed)
		if (rows.length === 0) return { ok: false, error: 'CSV parsed to no rows.' }
		return { ok: true, value: rows, format: 'csv' }
	} catch (e) {
		return { ok: false, error: `Invalid CSV: ${(e as Error).message}` }
	}
}

export function tryParse(text: string): ParseResult {
	const trimmed = text.trim()
	if (!trimmed) return { ok: false, error: 'Empty input.' }
	// JSON first: starts with { [ " or a digit
	if (/^[{[]/.test(trimmed)) return tryParseJson(trimmed)
	// Heuristic CSV: at least one comma and at least one newline
	if (trimmed.includes(',') && trimmed.includes('\n')) return tryParseCsv(trimmed)
	return { ok: false, error: 'Could not detect JSON or CSV.' }
}
