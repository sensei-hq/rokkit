/* Prop values an interpreter proposes, read the way the demo's own schema allows — or dropped.
 * Part of `validate`: nothing reaches a demo that its schema did not declare.
 */
import type { DemoPropSchema } from '#lib/koan/types.js'
import { propSchemaOf } from './demos'

const TRUE_WORDS = new Set([true, 'true', 'yes', 'on', '1', 1])
const FALSE_WORDS = new Set([false, 'false', 'no', 'off', '0', 0])

/** One prop value as its schema allows it, or `undefined` when it does not. */
const COERCE: Record<DemoPropSchema['type'], (value: unknown, schema: DemoPropSchema) => unknown> = {
	boolean: (v) => (TRUE_WORDS.has(v as never) ? true : FALSE_WORDS.has(v as never) ? false : undefined),
	enum: (v, s) => (s.type === 'enum' && s.options.includes(String(v)) ? String(v) : undefined),
	string: (v) => (typeof v === 'string' ? v : undefined),
	number: (v, s) => {
		const n = typeof v === 'number' ? v : Number(v)
		if (!Number.isFinite(n) || s.type !== 'number') return undefined
		return Math.min(s.max ?? Infinity, Math.max(s.min ?? -Infinity, n))
	}
}

/** The props the demo's schema declares, each coerced to its type; the rest are dropped. */
export function validProps(demo: string, props: Record<string, unknown> | undefined): Record<string, unknown> {
	const schema = propSchemaOf(demo)
	const out: Record<string, unknown> = {}
	for (const [name, value] of Object.entries(props ?? {})) {
		const rule = schema[name]
		const coerced = rule ? COERCE[rule.type](value, rule) : undefined
		if (coerced !== undefined) out[name] = coerced
	}
	return out
}
