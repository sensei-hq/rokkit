// Public surface for `@rokkit/graph/schema` — the ER/schema-flavoured views.

// Views over a shared `GraphState` (the canonical graph model).
export { default as EntityView } from './EntityView.svelte'
export { default as EntitiesView } from './EntitiesView.svelte'
export { default as NoteBlocks } from './NoteBlocks.svelte'

// The database-design viewer: views over a dbd-shaped `DesignModel`, composed by the host.
export { default as ContentHeader } from './ContentHeader.svelte'
export { default as OverviewView } from './OverviewView.svelte'
export { default as DiagramView } from './DiagramView.svelte'
export { default as SchemaSidebar } from './SchemaSidebar.svelte'
export { default as TableView } from './TableView.svelte'
export { default as ObjectView } from './ObjectView.svelte'
export { default as EnumView } from './EnumView.svelte'

export { SCHEMA_FIELDS, DEPS_FIELDS, fromSchemaModel, toGraphInput } from './fromSchemaModel.js'
export type { SchemaScope } from './fromSchemaModel.js'
export { inlineSegs, noteBlocks, splitLead } from './notes.js'
export { baseType, typeSize } from './column-type.js'
export type { Block, Seg } from './notes.js'

export { nodeKey, readableKind, stubAt, stubFor, withStubs } from './model.js'
export type {
	DesignCheck,
	DesignColumn,
	DesignDep,
	DesignEntity,
	DesignEnum,
	DesignIndex,
	DesignModel,
	DesignModule,
	DesignRef,
	DesignRefEnd,
	DesignSchema,
	DesignTable
} from './model.js'
export {
	KIND_ICONS,
	KIND_ORDER,
	allEntities,
	entityAt,
	kindCounts,
	kindLabel,
	pageFor
} from './entities.js'
export type { DesignItem, DesignKind } from './entities.js'
export {
	databaseLabel,
	designTabs,
	enumCount,
	headerStats,
	overviewCounts,
	schemaRows
} from './overview.js'
export type { DesignCount, DesignTab, SchemaRow } from './overview.js'
export { sidebarTree } from './sidebar.js'
export type { SidebarFilter, SidebarNode } from './sidebar.js'
export { enumDetail, objectDetail, tableDetail } from './details.js'
export type {
	DepRow,
	EnumDetail,
	FieldBadge,
	FieldRef,
	FieldRow,
	ObjectDetail,
	TableDetail
} from './details.js'
