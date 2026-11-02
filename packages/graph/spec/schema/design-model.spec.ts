/* The pure helpers behind the database-design views: what exists, what a page shows, what the
   overview counts and how the sidebar groups it — each checked against the model it reads. */
import { describe, it, expect, afterEach } from 'vitest'
import { messages } from '@rokkit/states'
import { DESIGN, ER_ONLY } from './design-fixture.js'
import { nodeKey, readableKind, stubAt, withStubs } from '../../src/schema/model.js'
import {
	KIND_ICONS,
	KIND_ORDER,
	allEntities,
	entityAt,
	kindCounts,
	kindLabel,
	pageFor
} from '../../src/schema/entities.js'
import {
	databaseLabel,
	designTabs,
	enumCount,
	headerStats,
	overviewCounts,
	schemaRows
} from '../../src/schema/overview.js'
import { sidebarTree } from '../../src/schema/sidebar.js'
import { enumDetail, objectDetail, tableDetail } from '../../src/schema/details.js'
import { splitLead } from '../../src/schema/notes.js'
import { DEFAULT_ICONS } from '../../src/icons.js'

afterEach(() => messages.reset())

describe('model', () => {
	it('keys an object schema.name, the id the diagram gives it', () => {
		expect(nodeKey('auth', 'users')).toBe('auth.users')
	})

	it('finds a stub by schema and name, and nothing in a model without stubs', () => {
		expect(stubAt(DESIGN, 'geo', 'regions')?.kind).toBe('external')
		expect(stubAt(DESIGN, 'auth', 'users')).toBeUndefined()
		expect(stubAt(ER_ONLY, 'geo', 'regions')).toBeUndefined()
	})

	it('draws the stubs beside the tables, and leaves a model without stubs as it is', () => {
		expect(withStubs(DESIGN).tables.map((t) => t.name)).toContain('regions')
		expect(withStubs(ER_ONLY)).toBe(ER_ONLY)
	})

	it('reads a kind as prose', () => {
		expect(readableKind('materialized_view')).toBe('materialized view')
	})
})

describe('entities', () => {
	it('lists tables, entities and enums by schema, then kind, then name', () => {
		expect(allEntities(DESIGN).map((e) => `${e.kind}:${e.key}`)).toEqual([
			'table:auth.sessions',
			'table:auth.users',
			'table:shop.customers',
			'table:shop.order_items',
			'table:shop.orders',
			'table:shop.products',
			'view:shop.order_totals',
			'procedure:shop.place_order',
			'sequence:shop.orders_id_seq',
			'enum:shop.order_status'
		])
	})

	it('lists only tables when the model carries only its ER half', () => {
		expect(allEntities(ER_ONLY).every((e) => e.kind === 'table')).toBe(true)
	})

	it('drops an entity of a kind it does not know rather than mislabelling it', () => {
		const model = { ...ER_ONLY, entities: [{ schema: 'x', name: 'y', kind: 'aggregate' }] }
		expect(allEntities(model).some((e) => e.name === 'y')).toBe(false)
	})

	it('carries the module an entity names', () => {
		const model = { ...ER_ONLY, tables: [{ ...ER_ONLY.tables[0], module: 'core' }] }
		expect(allEntities(model)[0].module).toBe('core')
	})

	it('resolves a key, a table winning over a routine of the same name', () => {
		const model = {
			...ER_ONLY,
			entities: [{ schema: 'auth', name: 'users', kind: 'function' }]
		}
		expect(entityAt(model, 'auth.users')?.kind).toBe('table')
		expect(entityAt(DESIGN, 'nope.nothing')).toBeUndefined()
	})

	it('counts each kind the model has, in kind order', () => {
		expect(kindCounts(DESIGN)).toEqual([
			{ kind: 'table', count: 6 },
			{ kind: 'view', count: 1 },
			{ kind: 'procedure', count: 1 },
			{ kind: 'sequence', count: 1 },
			{ kind: 'enum', count: 1 }
		])
	})

	it('names a kind in the one or many form, from the locale', () => {
		expect(kindLabel('table', 1)).toBe('Table')
		expect(kindLabel('materialized_view', 2)).toBe('Materialized views')
		messages.register('de', { graph: { kindTableMany: 'Tabellen' } })
		messages.setLocale('de')
		expect(kindLabel('table', 3)).toBe('Tabellen')
	})

	it('wears the diagram icon for every kind', () => {
		expect(KIND_ICONS.table).toBe(DEFAULT_ICONS.table)
		expect(KIND_ICONS.sequence).toBe(DEFAULT_ICONS.sequence)
		expect(KIND_ORDER.every((k) => KIND_ICONS[k])).toBe(true)
	})

	it('says which page opens a key: a table or stub its fields, a routine its deps, an enum its values', () => {
		expect(pageFor(DESIGN, 'auth.users')).toBe('table')
		expect(pageFor(DESIGN, 'geo.regions')).toBe('table')
		expect(pageFor(DESIGN, 'shop.order_totals')).toBe('object')
		expect(pageFor(DESIGN, 'shop.order_status')).toBe('enum')
		expect(pageFor(DESIGN, 'nope.nothing')).toBeUndefined()
	})
})

describe('overview', () => {
	it('counts schemas, tables, each entity kind, enums and references — only what exists', () => {
		expect(overviewCounts(DESIGN).map((c) => [c.key, c.count, c.label])).toEqual([
			['schemas', 2, 'Schemas'],
			['tables', 6, 'Tables'],
			['view', 1, 'View'],
			['procedure', 1, 'Procedure'],
			['sequence', 1, 'Sequence'],
			['enums', 1, 'Enum'],
			['references', 6, 'References']
		])
	})

	it('claims no count the model does not carry', () => {
		// No schema list, no enums, no entities: schemas come from the tables, the rest are absent.
		expect(overviewCounts(ER_ONLY).map((c) => c.key)).toEqual(['schemas', 'tables', 'references'])
		expect(overviewCounts({ tables: [], refs: [] })).toEqual([])
	})

	it('gives every count an icon', () => {
		expect(overviewCounts(DESIGN).every((c) => c.icon.startsWith('i-glyph:'))).toBe(true)
	})

	it('counts enums from the enum list, else from the schema entries, else not at all', () => {
		expect(enumCount(DESIGN)).toBe(1)
		expect(
			enumCount({
				...ER_ONLY,
				schemas: [
					{ name: 'a', enums: 2 },
					{ name: 'b', enums: 1 }
				]
			})
		).toBe(3)
		expect(enumCount({ ...ER_ONLY, schemas: [{ name: 'a' }] })).toBeUndefined()
		expect(enumCount(ER_ONLY)).toBeUndefined()
	})

	it('rows each schema with its tables, enums and views and routines', () => {
		expect(schemaRows(DESIGN)).toEqual([
			{ name: 'auth', tables: 2, enums: 0, other: 0 },
			{ name: 'shop', tables: 4, enums: 1, other: 3 }
		])
	})

	it('derives the schemas from the objects when the model lists none, and leaves unknowns unknown', () => {
		expect(schemaRows(ER_ONLY)).toEqual([
			{ name: 'auth', tables: 2, enums: undefined, other: undefined },
			{ name: 'shop', tables: 4, enums: undefined, other: undefined }
		])
		const listed = { ...ER_ONLY, schemas: [{ name: 'auth', enums: 4 }] }
		expect(schemaRows(listed)[0].enums).toBe(4)
	})

	it('names the database in prose', () => {
		expect(databaseLabel('postgresql')).toBe('PostgreSQL')
		expect(databaseLabel('Postgres')).toBe('PostgreSQL')
		expect(databaseLabel('sqlite')).toBe('SQLite')
		expect(databaseLabel('mysql')).toBe('mysql')
		expect(databaseLabel(undefined)).toBeUndefined()
	})

	it('states the header counts: tables, enums, refs', () => {
		expect(headerStats(DESIGN)).toEqual(['6 tables', '1 enum', '6 refs'])
		expect(headerStats(ER_ONLY)).toEqual(['6 tables', '6 refs'])
	})

	it('offers Overview, Diagram and Entities — no changelog', () => {
		expect(designTabs().map((t) => [t.value, t.label])).toEqual([
			['overview', 'Overview'],
			['diagram', 'Diagram'],
			['entities', 'Entities']
		])
	})
})

describe('sidebar tree', () => {
	const leaves = (nodes: ReturnType<typeof sidebarTree>): string[] =>
		nodes.flatMap((n) => (n.children ? leaves(n.children) : [`${n.kind}:${n.value}`]))

	it('groups every entity under its schema, each with its count and kind icon', () => {
		const tree = sidebarTree(DESIGN)
		expect(tree.map((n) => [n.label, n.badge])).toEqual([
			['auth', '2'],
			['shop', '8']
		])
		expect(tree[1].children?.find((n) => n.value === 'shop.order_totals')?.icon).toBe(
			KIND_ICONS.view
		)
		expect(tree.every((n) => n.expanded)).toBe(true)
	})

	it('hides a kind that is switched off, and a schema left with nothing', () => {
		const tree = sidebarTree(DESIGN, { hidden: ['table'] })
		expect(tree.map((n) => n.label)).toEqual(['shop'])
		expect(leaves(tree)).toEqual([
			'view:shop.order_totals',
			'procedure:shop.place_order',
			'sequence:shop.orders_id_seq',
			'enum:shop.order_status'
		])
	})

	it('searches names within the kinds that are on, ignoring case and spacing', () => {
		expect(leaves(sidebarTree(DESIGN, { query: '  ORDER ', hidden: ['table'] }))).toEqual([
			'view:shop.order_totals',
			'procedure:shop.place_order',
			'sequence:shop.orders_id_seq',
			'enum:shop.order_status'
		])
		expect(sidebarTree(DESIGN, { query: '(' })).toEqual([])
	})

	it('groups by module first when the model has modules, unmoduled entities after them', () => {
		const model = {
			...ER_ONLY,
			modules: [{ name: 'core' }],
			tables: ER_ONLY.tables.map((t) => (t.schema === 'auth' ? { ...t, module: 'core' } : t))
		}
		const tree = sidebarTree(model)
		expect(tree.map((n) => [n.label, n.badge])).toEqual([
			['core', '2'],
			['shop', '4']
		])
		expect(tree[0].children?.map((n) => n.label)).toEqual(['auth'])
	})

	it('drops a module whose entities the filter hides, rather than an empty group', () => {
		const model = {
			...ER_ONLY,
			modules: [{ name: 'core' }],
			tables: ER_ONLY.tables.map((t) => (t.schema === 'auth' ? { ...t, module: 'core' } : t))
		}
		expect(sidebarTree(model, { query: 'order' }).map((n) => n.label)).toEqual(['shop'])
	})

	it('never gives a group the value of an entity', () => {
		const groups = sidebarTree(DESIGN).map((n) => n.value)
		expect(groups.some((v) => allEntities(DESIGN).some((e) => e.key === v))).toBe(false)
	})
})

describe('table detail', () => {
	it('is undefined for a key that names no table or stub', () => {
		expect(tableDetail(DESIGN, 'shop.order_totals')).toBeUndefined()
	})

	it('badges each field: PK, FK (declared or derived), NN, UNIQUE, ENUM, IDENTITY, GENERATED', () => {
		const badges = (key: string) =>
			Object.fromEntries(tableDetail(DESIGN, key)!.fields.map((f) => [f.name, f.badges]))
		expect(badges('auth.users')).toEqual({
			id: ['pk', 'nn'],
			email: ['nn', 'uq'],
			name: [],
			created_at: ['nn']
		})
		expect(badges('shop.customers').region_id).toEqual(['fk'])
		expect(badges('shop.customers').user_id).toEqual(['fk', 'nn'])
		expect(badges('shop.products').sku).toEqual(['nn', 'uq'])
		expect(badges('shop.orders')).toMatchObject({
			id: ['pk', 'nn', 'identity'],
			status: ['nn', 'enum'],
			total: ['generated']
		})
	})

	it('does not read a unique expression index as a unique column', () => {
		expect(
			tableDetail(DESIGN, 'auth.users')!.fields.find((f) => f.name === 'name')!.badges
		).toEqual([])
	})

	it('says where a value comes from: the default, or the identity or generation clause', () => {
		const source = (key: string, col: string) =>
			tableDetail(DESIGN, key)!.fields.find((f) => f.name === col)!.source
		expect(source('auth.users', 'created_at')).toBe('now()')
		expect(source('shop.orders', 'id')).toBe('generated always as identity')
		expect(source('shop.orders', 'total')).toBe('generated always as (qty * price) stored')
		expect(source('auth.users', 'name')).toBeUndefined()
	})

	it('names what each field references, marking a stub target', () => {
		const refs = tableDetail(DESIGN, 'shop.customers')!.fields.map((f) => [f.name, f.refs])
		expect(refs).toEqual([
			['id', []],
			['user_id', [{ key: 'auth.users', label: 'auth.users.id', stub: undefined }]],
			['region_id', [{ key: 'geo.regions', label: 'geo.regions.id', stub: 'external' }]]
		])
	})

	it('splits the foreign keys out and in', () => {
		const users = tableDetail(DESIGN, 'auth.users')!
		expect(users.outRefs).toEqual([])
		expect(users.inRefs.map((r) => `${r.from.s}.${r.from.t}.${r.from.c}`)).toEqual([
			'auth.sessions.user_id',
			'shop.customers.user_id'
		])
	})

	it('lists what reads, writes or calls the table — and knows when the model has no dependency graph', () => {
		expect(tableDetail(DESIGN, 'shop.orders')!.usedBy).toEqual([
			{ key: 'shop.order_totals', kind: 'view', verb: 'reads', unresolved: false, known: true },
			{ key: 'shop.place_order', kind: 'procedure', verb: 'writes', unresolved: false, known: true }
		])
		expect(tableDetail(ER_ONLY, 'shop.orders')!.usedBy).toBeUndefined()
	})

	it('opens a stub as a table page, saying so', () => {
		const regions = tableDetail(DESIGN, 'geo.regions')!
		expect(regions.stub?.kind).toBe('external')
		expect(regions.inRefs).toHaveLength(1)
	})
})

describe('object detail', () => {
	it('is undefined for a key that is not a view or routine', () => {
		expect(objectDetail(DESIGN, 'auth.users')).toBeUndefined()
		expect(objectDetail(ER_ONLY, 'shop.order_totals')).toBeUndefined()
	})

	it('lists what it uses and what uses it, an unresolved target dimmed and not navigable', () => {
		const place = objectDetail(DESIGN, 'shop.place_order')!
		expect(place.entity.kind).toBe('procedure')
		expect(place.uses).toEqual([
			{ key: 'shop.orders', kind: 'table', verb: 'writes', unresolved: false, known: true },
			{ key: 'shop.order_totals', kind: 'view', verb: 'reads', unresolved: false, known: true },
			{ key: 'pg_catalog.now', kind: undefined, verb: 'calls', unresolved: true, known: false }
		])
		expect(objectDetail(DESIGN, 'shop.order_totals')!.usedBy.map((d) => d.key)).toEqual([
			'shop.place_order'
		])
	})

	it('does not list a self-reference as a dependent', () => {
		const model = {
			...DESIGN,
			deps: [
				{
					from: { s: 'shop', n: 'place_order' },
					to: { s: 'shop', n: 'place_order' },
					kind: 'calls'
				}
			]
		}
		expect(objectDetail(model, 'shop.place_order')!.usedBy).toEqual([])
		expect(objectDetail(model, 'shop.place_order')!.uses).toHaveLength(1)
	})
})

describe('enum detail', () => {
	it('is undefined for a key that names no enum', () => {
		expect(enumDetail(DESIGN, 'auth.users')).toBeUndefined()
		expect(enumDetail(ER_ONLY, 'shop.order_status')).toBeUndefined()
	})

	it('finds every column of its type, bare or schema-qualified', () => {
		expect(enumDetail(DESIGN, 'shop.order_status')!.columns).toEqual([
			{ table: 'shop.orders', column: 'status' },
			{ table: 'shop.order_items', column: 'state' }
		])
	})
})

describe('splitLead', () => {
	it('splits a note into its first paragraph and the blocks after it', () => {
		const { lead, rest } = splitLead('First `code` line.\n\n- one\n- two')
		expect(lead).toBe('First code line.')
		expect(rest).toHaveLength(1)
		expect(splitLead(undefined)).toEqual({ rest: [] })
	})
})
