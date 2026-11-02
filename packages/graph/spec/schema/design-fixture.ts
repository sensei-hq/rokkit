/* dbd's bundled sample design (site/src/lib/design/data.ts `sampleModel`), less its history —
   the shape both dbd's site and sensei hand the schema views. Plus one stub, a check, a
   partial index and an identity column, so every Details section has something to show. */
import type { DesignModel } from '../../src/schema/model.js'

export const DESIGN: DesignModel = {
	version: 3,
	project: {
		name: 'shopdb',
		db: 'postgresql',
		note: 'Storefront catalog, customers and orders.\n\nOrders are placed through `place_order`.'
	},
	schemas: [
		{ name: 'auth', tables: 2, enums: 0 },
		{ name: 'shop', tables: 4, enums: 1 }
	],
	tables: [
		{
			schema: 'auth',
			name: 'users',
			kind: 'table',
			noteMd: 'Account records. One row per signed-up person.',
			columns: [
				{ name: 'id', type: 'uuid', pk: true, nn: true, note: 'Primary key.' },
				{ name: 'email', type: 'text', nn: true, note: 'Login email — unique.' },
				{ name: 'name', type: 'text' },
				{ name: 'created_at', type: 'timestamptz', nn: true, def: 'now()' }
			],
			indexes: [
				{ def: '(email)', unique: true, name: 'users_email_key' },
				{ def: '(lower(name))', unique: true, name: 'users_name_key' },
				{ def: '(created_at)', name: 'users_created_at_idx', where: 'created_at > now()' }
			],
			checks: [{ name: 'users_email_check', expression: "email like '%@%'" }]
		},
		{
			schema: 'auth',
			name: 'sessions',
			kind: 'table',
			columns: [
				{ name: 'id', type: 'uuid', pk: true, nn: true },
				{ name: 'user_id', type: 'uuid', nn: true }
			]
		},
		{
			schema: 'shop',
			name: 'customers',
			kind: 'table',
			columns: [
				{ name: 'id', type: 'uuid', pk: true, nn: true },
				{ name: 'user_id', type: 'uuid', nn: true },
				{ name: 'region_id', type: 'int', fk: true }
			]
		},
		{
			schema: 'shop',
			name: 'products',
			kind: 'table',
			columns: [
				{ name: 'id', type: 'uuid', pk: true, nn: true },
				{ name: 'sku', type: 'varchar(32)', nn: true, uq: true }
			]
		},
		{
			schema: 'shop',
			name: 'orders',
			kind: 'table',
			noteMd: 'A placed order.\n- belongs to one customer',
			columns: [
				{ name: 'id', type: 'bigint', pk: true, nn: true, identity: 'always' },
				{ name: 'customer_id', type: 'uuid', nn: true },
				{ name: 'status', type: 'order_status', nn: true, en: true, def: "'pending'" },
				{ name: 'total', type: 'integer', generated: 'qty * price' }
			]
		},
		{
			schema: 'shop',
			name: 'order_items',
			kind: 'table',
			columns: [
				{ name: 'id', type: 'bigserial', pk: true, nn: true },
				{ name: 'order_id', type: 'bigint', nn: true },
				{ name: 'product_id', type: 'uuid', nn: true },
				{ name: 'state', type: 'shop.order_status' }
			]
		}
	],
	refs: [
		{
			from: { s: 'auth', t: 'sessions', c: 'user_id' },
			to: { s: 'auth', t: 'users', c: 'id' },
			action: 'cascade'
		},
		{ from: { s: 'shop', t: 'customers', c: 'user_id' }, to: { s: 'auth', t: 'users', c: 'id' } },
		{
			from: { s: 'shop', t: 'customers', c: 'region_id' },
			to: { s: 'geo', t: 'regions', c: 'id' }
		},
		{
			from: { s: 'shop', t: 'orders', c: 'customer_id' },
			to: { s: 'shop', t: 'customers', c: 'id' }
		},
		{
			from: { s: 'shop', t: 'order_items', c: 'order_id' },
			to: { s: 'shop', t: 'orders', c: 'id' }
		},
		{
			from: { s: 'shop', t: 'order_items', c: 'product_id' },
			to: { s: 'shop', t: 'products', c: 'id' }
		}
	],
	stubs: [
		{
			schema: 'geo',
			name: 'regions',
			kind: 'external',
			columns: [{ name: 'id', type: 'int', pk: true }]
		}
	],
	entities: [
		{ schema: 'shop', name: 'order_totals', kind: 'view', note: 'Per-order line count and total.' },
		{ schema: 'shop', name: 'place_order', kind: 'procedure' },
		{ schema: 'shop', name: 'orders_id_seq', kind: 'sequence' }
	],
	deps: [
		{ from: { s: 'shop', n: 'order_totals' }, to: { s: 'shop', n: 'orders' }, kind: 'reads' },
		{ from: { s: 'shop', n: 'order_totals' }, to: { s: 'shop', n: 'order_items' }, kind: 'reads' },
		{ from: { s: 'shop', n: 'place_order' }, to: { s: 'shop', n: 'orders' }, kind: 'writes' },
		{ from: { s: 'shop', n: 'place_order' }, to: { s: 'shop', n: 'order_totals' }, kind: 'reads' },
		{
			from: { s: 'shop', n: 'place_order' },
			to: { s: 'pg_catalog', n: 'now' },
			kind: 'calls',
			unresolved: true
		}
	],
	enums: [
		{
			schema: 'shop',
			name: 'order_status',
			values: ['pending', 'paid', 'shipped'],
			note: 'Where an order is in its lifecycle.'
		}
	]
}

/** Only the ER half — what a host with no dependency graph, enums or project block passes. */
export const ER_ONLY: DesignModel = { tables: DESIGN.tables, refs: DESIGN.refs }
