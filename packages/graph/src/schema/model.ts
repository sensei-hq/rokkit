/**
 * The shape of a database design the `@rokkit/graph/schema` views read.
 *
 * Duck-typed to dbd's `SchemaModel` (dbd's `site/src/lib/design/model.ts`, the TS mirror of
 * `schema_model.rs`) WITHOUT importing it — the same rule `fromSchemaModel.ts` follows, so this
 * package never becomes a third definition to keep in step. Only what a view reads is named.
 *
 * The ER half — `tables` and `refs` — is required. Everything else is optional: a host that has
 * no project block, no schema list, no dependency graph or no enums passes the model without
 * them, and each view renders an empty state for what is absent rather than inventing it.
 */

export type DesignColumn = {
	name: string
	type: string
	pk?: boolean
	nn?: boolean
	/** Typed by an enum. */
	en?: boolean
	def?: string
	note?: string
	fk?: boolean
	uq?: boolean
	identity?: 'always' | 'by default'
	/** The expression of a `GENERATED ALWAYS AS (…) STORED` column. */
	generated?: string
}

export type DesignIndex = { def: string; unique?: boolean; name?: string; where?: string }
export type DesignCheck = { name?: string; expression: string }

export type DesignTable = {
	schema: string
	name: string
	/** `table` in `tables`; `external | out_of_scope | unresolved` in `stubs`. */
	kind?: string
	note?: string
	noteMd?: string
	columns: DesignColumn[]
	indexes?: DesignIndex[]
	checks?: DesignCheck[]
	module?: string
}

export type DesignRefEnd = { s: string; t: string; c: string }
export type DesignRef = { from: DesignRefEnd; to: DesignRefEnd; action?: string }

/** A view, materialized view, function, procedure, trigger or sequence. */
export type DesignEntity = {
	schema: string
	name: string
	kind: string
	note?: string
	noteMd?: string
	module?: string
}

export type DesignDep = {
	from: { s: string; n: string }
	to: { s: string; n: string }
	/** `reads | writes | calls | member` */
	kind: string
	unresolved?: boolean
}

export type DesignEnum = {
	schema: string
	name: string
	values: string[]
	note?: string
	noteMd?: string
	module?: string
}

export type DesignSchema = { name: string; tables?: number; enums?: number }
export type DesignModule = { name: string }

export type DesignModel = {
	version?: number
	project?: { name?: string; db?: string; note?: string }
	schemas?: DesignSchema[]
	tables: DesignTable[]
	refs: DesignRef[]
	stubs?: DesignTable[]
	entities?: DesignEntity[]
	deps?: DesignDep[]
	enums?: DesignEnum[]
	modules?: DesignModule[]
}

/** The key every view, the diagram and the sidebar share for one object: `schema.name`. */
export const nodeKey = (schema: string, name: string): string => `${schema}.${name}`

/** The stub a `schema.name` names, if it names one. */
export const stubAt = (model: DesignModel, schema: string, name: string): DesignTable | undefined =>
	model.stubs?.find((t) => t.schema === schema && t.name === name)

/** The stub a key names — matched whole, so a name with a dot in it still resolves. */
export const stubFor = (model: DesignModel, key: string): DesignTable | undefined =>
	model.stubs?.find((t) => nodeKey(t.schema, t.name) === key)

/**
 * The model the ER graph draws: the stubs beside the tables. `toGraphInput` makes nodes of
 * `tables` alone, so without this every foreign key into a stub would be an unplaced edge.
 */
export const withStubs = (model: DesignModel): DesignModel =>
	model.stubs?.length ? { ...model, tables: [...model.tables, ...model.stubs] } : model

/** `materialized_view` → `materialized view`: a kind as it reads in prose. */
export const readableKind = (kind: string): string => kind.replace(/_/g, ' ')
