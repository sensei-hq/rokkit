/**
 * Every object of a design in one list — tables, the views, routines, triggers and sequences
 * of `entities`, and the enums — so the sidebar and the pages share one notion of what exists.
 * Keyed `schema.name`, the id the diagram gives the same node.
 */
import { DEFAULT_ICONS } from '../icons.js'
import { messages } from '@rokkit/states'
import type { GraphMessageKey } from '../messages.js'
import { nodeKey, stubFor } from './model.js'
import type { DesignModel } from './model.js'

export type DesignKind =
	| 'table'
	| 'view'
	| 'materialized_view'
	| 'function'
	| 'procedure'
	| 'trigger'
	| 'sequence'
	| 'enum'

/** Reading order: storage, derived data, behaviour, then the sequences and types tables use. */
export const KIND_ORDER: DesignKind[] = [
	'table',
	'view',
	'materialized_view',
	'function',
	'procedure',
	'trigger',
	'sequence',
	'enum'
]

/** The diagram card's glyph for each kind, so an object looks the same in every view. */
export const KIND_ICONS: Record<DesignKind, string> = Object.fromEntries(
	KIND_ORDER.map((kind) => [kind, DEFAULT_ICONS[kind]])
) as Record<DesignKind, string>

const LABELS: Record<DesignKind, [GraphMessageKey, GraphMessageKey]> = {
	table: ['kindTableOne', 'kindTableMany'],
	view: ['kindViewOne', 'kindViewMany'],
	materialized_view: ['kindMaterializedViewOne', 'kindMaterializedViewMany'],
	function: ['kindFunctionOne', 'kindFunctionMany'],
	procedure: ['kindProcedureOne', 'kindProcedureMany'],
	trigger: ['kindTriggerOne', 'kindTriggerMany'],
	sequence: ['kindSequenceOne', 'kindSequenceMany'],
	enum: ['kindEnumOne', 'kindEnumMany']
}

/** `Table` or `Tables`, from the active locale. */
export const kindLabel = (kind: DesignKind, count: number): string =>
	messages.graph[LABELS[kind][count === 1 ? 0 : 1]]

export type DesignItem = {
	key: string
	kind: DesignKind
	schema: string
	name: string
	note?: string
	module?: string
}

type Named = { schema: string; name: string; note?: string; module?: string }

const rank = (kind: DesignKind) => KIND_ORDER.indexOf(kind)
const isKind = (kind: string): kind is DesignKind => KIND_ORDER.includes(kind as DesignKind)

function item(kind: DesignKind, e: Named): DesignItem {
	return {
		key: nodeKey(e.schema, e.name),
		kind,
		schema: e.schema,
		name: e.name,
		note: e.note,
		...(e.module === undefined ? {} : { module: e.module })
	}
}

/**
 * Every object, ordered by schema, then kind, then name. An entity of a kind this package does
 * not know is left out rather than shown under a kind it is not.
 */
export function allEntities(model: DesignModel): DesignItem[] {
	const items = [
		...model.tables.map((t) => item('table', t)),
		...(model.entities ?? []).flatMap((e) => (isKind(e.kind) ? [item(e.kind, e)] : [])),
		...(model.enums ?? []).map((e) => item('enum', e))
	]
	return items.sort(
		(a, b) =>
			a.schema.localeCompare(b.schema) ||
			rank(a.kind) - rank(b.kind) ||
			a.name.localeCompare(b.name)
	)
}

/**
 * The object a key names. A table wins over a routine of the same name — Postgres lets a
 * function share a table's name, and the diagram, which ids both `schema.name`, does the same.
 */
export function entityAt(model: DesignModel, key: string): DesignItem | undefined {
	return allEntities(model)
		.filter((e) => e.key === key)
		.sort((a, b) => rank(a.kind) - rank(b.kind))[0]
}

/** Each kind the model has, with its count, in kind order. */
export function kindCounts(model: DesignModel): { kind: DesignKind; count: number }[] {
	const all = allEntities(model)
	return KIND_ORDER.map((kind) => ({
		kind,
		count: all.filter((e) => e.kind === kind).length
	})).filter((k) => k.count > 0)
}

/**
 * Which page opens a key: a table — or a stub, which is table-shaped and whose point is what
 * references it — its fields; a view, routine, trigger or sequence its dependencies; an enum
 * its values. `undefined` for a key the model does not carry.
 */
export function pageFor(model: DesignModel, key: string): 'table' | 'object' | 'enum' | undefined {
	const found = entityAt(model, key)
	if (found) return found.kind === 'table' ? 'table' : found.kind === 'enum' ? 'enum' : 'object'
	return stubFor(model, key) ? 'table' : undefined
}
