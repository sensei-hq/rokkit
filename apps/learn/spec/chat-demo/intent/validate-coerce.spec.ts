/* Characterization: the corners of `validate` the catalogue alone does not reach — a numeric
 * prop schema (no demo declares one today, so it is injected here) and a show that hands a
 * single record, rather than rows, to a data demo.
 */
import { describe, it, expect, vi } from 'vitest'
import type { Interpretation, Screen } from '../../../src/lib/chat-demo/intent/types'

vi.mock('../../../src/lib/chat-demo/intent/demos', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../../src/lib/chat-demo/intent/demos')>()
	return {
		...actual,
		propSchemaOf: (id: string) =>
			id === 'table'
				? {
						...actual.propSchemaOf(id),
						rows: { type: 'number', default: 5, min: 1, max: 10 },
						cols: { type: 'number', default: 3 }
					}
				: actual.propSchemaOf(id)
	}
})

const { validate } = await import('../../../src/lib/chat-demo/intent/validate')

const sure = (i: Omit<Interpretation, 'confidence'>): Interpretation => ({ confidence: 1, ...i })
const table: Screen = { demo: 'table', props: {} }
const propsOf = (props: Record<string, unknown>) => validate(sure({ intent: 'modify', props }), table).props

describe('validate — numeric props', () => {
	it('keeps a number, and reads one from a numeric string', () => {
		expect(propsOf({ rows: 4 })).toEqual({ rows: 4 })
		expect(propsOf({ rows: '7' })).toEqual({ rows: 7 })
	})

	it('clamps to the schema’s min and max', () => {
		expect(propsOf({ rows: 50 })).toEqual({ rows: 10 })
		expect(propsOf({ rows: -3 })).toEqual({ rows: 1 })
	})

	it('leaves a number unbounded when the schema sets no limits', () => {
		expect(propsOf({ cols: 1e6 })).toEqual({ cols: 1e6 })
	})

	it('drops a value that is not a finite number', () => {
		expect(validate(sure({ intent: 'modify', props: { rows: 'many' } }), table).intent).toBe('clarify')
		expect(propsOf({ rows: Infinity, striped: true })).toEqual({ striped: true })
	})
})

describe('validate — a single record handed to a show', () => {
	it('keeps one flat record for a data demo', () => {
		const record = { name: 'Ada', role: 'admin' }
		expect(validate(sure({ intent: 'show', demo: 'form', data: record }), null).data).toEqual(record)
	})

	it('drops a record that nests objects', () => {
		const reading = validate(sure({ intent: 'show', demo: 'form', data: { name: 'Ada', address: { city: 'X' } } }), null)
		expect(reading).not.toHaveProperty('data')
	})

	it('drops a record with more fields than a show can lay out', () => {
		const wide = Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`f${i}`, i]))
		expect(validate(sure({ intent: 'show', demo: 'form', data: wide }), null)).not.toHaveProperty('data')
	})

	it('drops data that is neither rows nor a record', () => {
		expect(validate(sure({ intent: 'show', demo: 'table', data: 'rows please' }), null)).not.toHaveProperty('data')
		expect(validate(sure({ intent: 'show', demo: 'table', data: [] }), null)).not.toHaveProperty('data')
	})
})
