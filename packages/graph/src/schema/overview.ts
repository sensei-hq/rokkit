/**
 * A design at a glance: what the overview counts, the header's counts line and its tabs.
 *
 * Pure, so every number can be checked against the model it claims to count. A count the model
 * does not carry is left out rather than shown as 0 — a model with no `entities` half has not
 * said it has no views, and "0 views" would claim a fact it never carried.
 */
import { messages } from '@rokkit/states'
import { DEFAULT_ICONS } from '../icons.js'
import { counted, say } from '../messages.js'
import type { GraphMessageKey } from '../messages.js'
import { KIND_ICONS, KIND_ORDER, kindLabel } from './entities.js'
import type { DesignModel } from './model.js'

export type DesignCount = { key: string; count: number; label: string; icon: string }

const tally = (
	key: string,
	count: number,
	[one, many]: [GraphMessageKey, GraphMessageKey],
	icon: string
): DesignCount => ({ key, count, label: messages.graph[count === 1 ? one : many], icon })

/**
 * How many enums the design has: its enum list when it carries one, else the schema entries'
 * counts when they carry them, else unknown.
 */
export function enumCount(model: DesignModel): number | undefined {
	if (model.enums) return model.enums.length
	const counts = (model.schemas ?? []).map((s) => s.enums)
	if (counts.length === 0 || counts.some((n) => n === undefined)) return undefined
	return counts.reduce<number>((total, n) => total + (n as number), 0)
}

/** The schemas the model lists, or — when it lists none — the ones its objects name. */
function schemaNames(model: DesignModel): string[] {
	if (model.schemas) return model.schemas.map((s) => s.name)
	const named = [...model.tables, ...(model.entities ?? []), ...(model.enums ?? [])].map(
		(o) => o.schema
	)
	return [...new Set(named)].sort((a, b) => a.localeCompare(b))
}

/** Schemas, tables, each entity kind the design has, enums and references — in that order. */
export function overviewCounts(model: DesignModel): DesignCount[] {
	const entities = model.entities ?? []
	const kinds = KIND_ORDER.filter((k) => k !== 'table' && k !== 'enum').map((kind) => {
		const count = entities.filter((e) => e.kind === kind).length
		return { key: kind, count, label: kindLabel(kind, count), icon: KIND_ICONS[kind] }
	})
	return [
		tally(
			'schemas',
			schemaNames(model).length,
			['kindSchemaOne', 'kindSchemaMany'],
			DEFAULT_ICONS.schema
		),
		tally('tables', model.tables.length, ['kindTableOne', 'kindTableMany'], KIND_ICONS.table),
		...kinds,
		tally('enums', enumCount(model) ?? 0, ['kindEnumOne', 'kindEnumMany'], KIND_ICONS.enum),
		tally(
			'references',
			model.refs.length,
			['kindReferenceOne', 'kindReferenceMany'],
			DEFAULT_ICONS.fk
		)
	].filter((c) => c.count > 0)
}

export type SchemaRow = { name: string; tables: number; enums?: number; other?: number }

/**
 * The same counts, per schema. Tables are counted from the model rather than read from the
 * schema entry, so the two halves of the page cannot disagree. Enums come from the enum list,
 * else the schema entry; views and routines from `entities`. Either is `undefined` when the
 * model does not carry it.
 */
export function schemaRows(model: DesignModel): SchemaRow[] {
	return schemaNames(model).map((name) => {
		const listed = model.schemas?.find((s) => s.name === name)
		return {
			name,
			tables: model.tables.filter((t) => t.schema === name).length,
			enums: model.enums ? model.enums.filter((e) => e.schema === name).length : listed?.enums,
			other: model.entities?.filter((e) => e.schema === name).length
		}
	})
}

const DATABASES: Record<string, string> = {
	postgresql: 'PostgreSQL',
	postgres: 'PostgreSQL',
	supabase: 'Supabase',
	sqlite: 'SQLite',
	convex: 'Convex'
}

/** How the database type reads in prose — a name dbd does not know reads as given. */
export function databaseLabel(db: string | undefined): string | undefined {
	if (db === undefined) return undefined
	return DATABASES[db.toLowerCase()] ?? db
}

/** The header's counts line: tables, enums (when known), refs. */
export function headerStats(model: DesignModel): string[] {
	const enums = enumCount(model)
	return [
		counted(model.tables.length, 'statTableOne', 'statTableMany'),
		...(enums === undefined ? [] : [counted(enums, 'statEnumOne', 'statEnumMany')]),
		counted(model.refs.length, 'statRefOne', 'statRefMany')
	]
}

export type DesignTab = { value: string; label: string; icon?: string }

/**
 * The design-level tabs. A host adds one — a changelog, say — by passing its own list to
 * `ContentHeader`; this is only the default.
 */
export function designTabs(): DesignTab[] {
	return [
		{ value: 'overview', label: say('tabOverview'), icon: DEFAULT_ICONS.database },
		{ value: 'diagram', label: say('tabDiagram'), icon: DEFAULT_ICONS.table },
		{ value: 'entities', label: say('tabEntities'), icon: DEFAULT_ICONS.schema }
	]
}
