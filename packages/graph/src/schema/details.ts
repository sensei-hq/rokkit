/**
 * What an object's page shows, derived from the design and nothing else: a table's fields with
 * their settings, defaults and references; its foreign keys in and out; what depends on it; a
 * view's or routine's dependencies both ways; an enum's columns.
 */
import { entityAt } from './entities.js'
import type { DesignItem, DesignKind } from './entities.js'
import { nodeKey, stubAt, stubFor } from './model.js'
import type {
	DesignColumn,
	DesignDep,
	DesignEnum,
	DesignModel,
	DesignRef,
	DesignTable
} from './model.js'

/** A column's settings, in the order a reader scans them. */
export type FieldBadge = 'pk' | 'fk' | 'nn' | 'uq' | 'enum' | 'identity' | 'generated'

export type FieldRef = {
	/** The referenced table's key — what a press navigates to. */
	key: string
	/** `schema.table.column`. */
	label: string
	/** Set when the target is a stub: `external`, `out_of_scope` or `unresolved`. */
	stub?: string
}

export type FieldRow = {
	name: string
	type: string
	badges: FieldBadge[]
	/** The default, or the identity / generation clause in the DDL's own words. */
	source?: string
	refs: FieldRef[]
	note?: string
}

/** One end of a dependency, from the page's side. */
export type DepRow = {
	key: string
	/** The other end's kind; `undefined` when the model does not describe it. */
	kind?: DesignKind
	/** `reads | writes | calls | member` */
	verb: string
	/** The model marked the target as a built-in or a dangle — dim it, never drop it. */
	unresolved: boolean
	/** The other end is an object of this design, so it can be opened. */
	known: boolean
}

export type TableDetail = {
	table: DesignTable
	/** Set when the key names a stub rather than one of the design's tables. */
	stub?: DesignTable
	fields: FieldRow[]
	outRefs: DesignRef[]
	inRefs: DesignRef[]
	/** What reads, writes or calls the table; `undefined` when the model has no dependency graph. */
	usedBy?: DepRow[]
}

const endKey = (end: { s: string; n: string }) => nodeKey(end.s, end.n)

function depRow(model: DesignModel, dep: DesignDep, side: 'from' | 'to'): DepRow {
	const other = entityAt(model, endKey(dep[side]))
	return {
		key: endKey(dep[side]),
		kind: other?.kind,
		verb: dep.kind,
		unresolved: dep.unresolved === true,
		known: other !== undefined
	}
}

/** Dependencies landing on `key`, a self-reference left out. */
const dependents = (model: DesignModel, key: string): DesignDep[] =>
	(model.deps ?? []).filter((d) => endKey(d.to) === key && endKey(d.from) !== key)

/**
 * The columns a unique constraint covers: `uq` (v2), plus a unique index on one plain column —
 * a v1 payload says it only that way. An expression index like `(lower(email))` names no column.
 */
function uniqueColumns(table: DesignTable): Set<string> {
	return new Set([
		...table.columns.filter((c) => c.uq).map((c) => c.name),
		...(table.indexes ?? [])
			.filter((ix) => ix.unique)
			.map((ix) => ix.def.replace(/^\(|\)$/g, '').trim())
			.filter((col) => /^[A-Za-z_][\w$]*$/.test(col))
	])
}

const BADGE_TESTS: [FieldBadge, (c: DesignColumn, fk: boolean, uq: boolean) => boolean][] = [
	['pk', (c) => c.pk === true],
	['fk', (c, fk) => c.fk === true || fk],
	['nn', (c) => c.nn === true],
	['uq', (c, _fk, uq) => uq && !c.pk],
	['enum', (c) => c.en === true],
	['identity', (c) => c.identity !== undefined],
	['generated', (c) => c.generated !== undefined]
]

/**
 * An identity or generated column has no default — Postgres refuses one — but it is where a
 * reader looks for how the value arrives, so this says, in the DDL's own words.
 */
function valueSource(c: DesignColumn): string | undefined {
	if (c.identity) return `generated ${c.identity} as identity`
	if (c.generated) return `generated always as (${c.generated}) stored`
	return c.def
}

function fieldRow(
	model: DesignModel,
	c: DesignColumn,
	outRefs: DesignRef[],
	unique: Set<string>
): FieldRow {
	const refs = outRefs.filter((r) => r.from.c === c.name)
	return {
		name: c.name,
		type: c.type,
		badges: BADGE_TESTS.filter(([, test]) => test(c, refs.length > 0, unique.has(c.name))).map(
			([b]) => b
		),
		source: valueSource(c),
		refs: refs.map((r) => ({
			key: nodeKey(r.to.s, r.to.t),
			label: `${r.to.s}.${r.to.t}.${r.to.c}`,
			stub: stubAt(model, r.to.s, r.to.t)?.kind
		})),
		note: c.note
	}
}

/** A table's page — or a stub's, which is table-shaped. `undefined` for any other key. */
export function tableDetail(model: DesignModel, key: string): TableDetail | undefined {
	const own = model.tables.find((t) => nodeKey(t.schema, t.name) === key)
	const stub = own ? undefined : stubFor(model, key)
	const table = own ?? stub
	if (!table) return undefined

	const outRefs = model.refs.filter((r) => nodeKey(r.from.s, r.from.t) === key)
	const inRefs = model.refs.filter((r) => nodeKey(r.to.s, r.to.t) === key)
	const unique = uniqueColumns(table)
	return {
		table,
		stub,
		fields: table.columns.map((c) => fieldRow(model, c, outRefs, unique)),
		outRefs,
		inRefs,
		usedBy: model.deps ? dependents(model, key).map((d) => depRow(model, d, 'from')) : undefined
	}
}

export type ObjectDetail = { entity: DesignItem; uses: DepRow[]; usedBy: DepRow[] }

/** A view's, routine's, trigger's or sequence's page. `undefined` for a table, an enum or a miss. */
export function objectDetail(model: DesignModel, key: string): ObjectDetail | undefined {
	const entity = entityAt(model, key)
	if (!entity || entity.kind === 'table' || entity.kind === 'enum') return undefined
	return {
		entity,
		uses: (model.deps ?? [])
			.filter((d) => endKey(d.from) === key)
			.map((d) => depRow(model, d, 'to')),
		usedBy: dependents(model, key).map((d) => depRow(model, d, 'from'))
	}
}

export type EnumDetail = { enum: DesignEnum; columns: { table: string; column: string }[] }

/** An enum's page: its values and every column of its type, named bare or schema-qualified. */
export function enumDetail(model: DesignModel, key: string): EnumDetail | undefined {
	const en = model.enums?.find((e) => nodeKey(e.schema, e.name) === key)
	if (!en) return undefined
	const typed = (type: string) => type === en.name || type === nodeKey(en.schema, en.name)
	return {
		enum: en,
		columns: model.tables.flatMap((t) =>
			t.columns
				.filter((c) => typed(c.type))
				.map((c) => ({ table: nodeKey(t.schema, t.name), column: c.name }))
		)
	}
}
