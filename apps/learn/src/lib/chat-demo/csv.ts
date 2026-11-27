/* A tiny RFC-4180-ish CSV parser for the /chat data-upload demo. */
import { isNumericString } from './columns'

// ─── CSV parsing ────────────────────────────────────────────────────────

type TokenizerState = {
	rows: string[][]
	field: string
	row: string[]
	inQuotes: boolean
}

/**
 * Advance past a character while inside a quoted field. Handles the
 * doubled-quote escape (`""` → literal `"`) and the closing quote.
 * Returns the (possibly advanced, to skip an escaped quote) index.
 */
function consumeQuotedChar(cleaned: string, i: number, state: TokenizerState): number {
	const c = cleaned[i]
	if (c !== '"') {
		state.field += c
		return i
	}
	if (cleaned[i + 1] === '"') {
		state.field += '"'
		return i + 1
	}
	state.inQuotes = false
	return i
}

/** Advance past a character outside any quoted field (field/row/quote-start delimiters). */
function consumeUnquotedChar(c: string, state: TokenizerState): void {
	if (c === '"') {
		state.inQuotes = true
	} else if (c === ',') {
		state.row.push(state.field)
		state.field = ''
	} else if (c === '\n') {
		state.row.push(state.field)
		state.rows.push(state.row)
		state.row = []
		state.field = ''
	} else {
		state.field += c
	}
}

/**
 * Character-by-character tokenizer for the CSV state machine: splits
 * newline-normalized text into rows of raw (still-quoted) string fields.
 */
function tokenizeCSV(cleaned: string): string[][] {
	const state: TokenizerState = { rows: [], field: '', row: [], inQuotes: false }
	for (let i = 0; i < cleaned.length; i++) {
		if (state.inQuotes) {
			i = consumeQuotedChar(cleaned, i, state)
		} else {
			consumeUnquotedChar(cleaned[i], state)
		}
	}
	state.row.push(state.field)
	if (state.row.length > 1 || state.row[0] !== '') state.rows.push(state.row)
	return state.rows
}

/** First row is the header; remaining rows become header-keyed objects. */
function rowsToObjects(rows: string[][]): Record<string, unknown>[] {
	if (rows.length === 0) return []
	const headers = rows[0]
	const out: Record<string, unknown>[] = []
	for (let r = 1; r < rows.length; r++) {
		const obj: Record<string, unknown> = {}
		for (let c = 0; c < headers.length; c++) {
			obj[headers[c]] = rows[r][c] ?? ''
		}
		out.push(obj)
	}
	return out
}

/** Coerce a single raw CSV string field into null / number / boolean / string. */
function coerceFieldValue(v: string): unknown {
	if (v === '') return null
	if (isNumericString(v)) return Number(v)
	if (v === 'true' || v === 'false') return v === 'true'
	return v
}

// Coerce numeric / boolean strings now so consumers don't have to.
function coerceRowTypes(rows: Record<string, unknown>[]): void {
	for (const row of rows) {
		for (const key of Object.keys(row)) {
			const v = row[key]
			if (typeof v !== 'string') continue
			row[key] = coerceFieldValue(v)
		}
	}
}

/**
 * Tiny RFC-4180-ish CSV parser. Handles quoted fields with commas and
 * doubled-up quotes (""). Doesn't try to be papaparse — just enough to
 * get a real-world CSV into rows.
 */
export function parseCSV(text: string): Record<string, unknown>[] {
	const cleaned = text.replace(/\r\n?/g, '\n').trim()
	if (!cleaned) return []
	const rows = tokenizeCSV(cleaned)
	const out = rowsToObjects(rows)
	coerceRowTypes(out)
	return out
}
