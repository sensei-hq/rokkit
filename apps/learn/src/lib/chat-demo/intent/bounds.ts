/* How much generated data a show may carry. Part of `validate`: a model can invent a dataset
 * for a data demo, but only flat rows (or one flat record) within these bounds get through.
 */
import { VIEWS, type Interpretation } from './types'

export const isRecord = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v)

/** Demos a show may hand data to: the views a dataset can take. */
const DATA_DEMOS = new Set<string>(VIEWS)
const MAX_ROWS = 200
const MAX_FIELDS = 12

const flat = (v: unknown) =>
	!isRecord(v) || (Object.keys(v).length <= MAX_FIELDS && Object.values(v).every((x) => x === null || typeof x !== 'object'))

/** Data a show can use — at most MAX_ROWS flat rows, or one flat record — else undefined. */
function bounded(data: unknown): unknown {
	if (Array.isArray(data)) return data.length > 0 && data.length <= MAX_ROWS && data.every(flat) ? data : undefined
	return isRecord(data) && flat(data) ? data : undefined
}

/** A show keeps generated data only for a data demo, and only within bounds. */
export function withData(i: Interpretation): Interpretation {
	if (i.intent !== 'show' || i.data === undefined) return i
	const data = DATA_DEMOS.has(i.demo as string) ? bounded(i.data) : undefined
	const { data: _, ...rest } = i
	return data === undefined ? rest : { ...rest, data }
}
