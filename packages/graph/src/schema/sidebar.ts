/**
 * The sidebar's tree: every object of a design under its schema — and, in a workspace's model,
 * under its module first, in the model's module order — filtered by kind and by name.
 *
 * Shaped for rokkit's `Tree` with its default fields (`value`, `label`, `icon`, `badge`,
 * `children`, `expanded`), so the sidebar is the Tree and nothing hand-rolled.
 */
import { DEFAULT_ICONS } from '../icons.js'
import { allEntities, KIND_ICONS } from './entities.js'
import type { DesignItem, DesignKind } from './entities.js'
import type { DesignModel } from './model.js'

export type SidebarNode = {
	/** An object's `schema.name`; a group's is prefixed, so it can never equal an object's. */
	value: string
	label: string
	icon?: string
	/** A group's object count, as text — the Tree's badge. */
	badge?: string
	/** Set on an object, never on a group — how a selection tells the two apart. */
	kind?: DesignKind
	children?: SidebarNode[]
	expanded?: boolean
}

export type SidebarFilter = {
	/** Matched against names, ignoring case and surrounding space. Plain text, never a pattern. */
	query?: string
	/** Kinds switched off. */
	hidden?: DesignKind[]
}

const leaf = (e: DesignItem): SidebarNode => ({
	value: e.key,
	label: e.name,
	icon: KIND_ICONS[e.kind],
	kind: e.kind
})

/** A schema or module row: its members as children, their count as the badge, open. */
const group = (
	value: string,
	label: string,
	icon: string,
	children: SidebarNode[]
): SidebarNode => ({
	value,
	label,
	icon,
	badge: String(children.reduce((n, child) => n + (child.kind ? 1 : Number(child.badge)), 0)),
	children,
	expanded: true
})

function bySchema(items: DesignItem[], scope: string): SidebarNode[] {
	return [...new Set(items.map((e) => e.schema))].map((schema) => {
		const members = items.filter((e) => e.schema === schema)
		return group(`schema:${scope}/${schema}`, schema, DEFAULT_ICONS.schema, members.map(leaf))
	})
}

/**
 * The tree, with a module or schema left out once nothing in it is shown. An object naming a
 * module the model does not list is grouped after the modules, by schema, rather than dropped.
 */
export function sidebarTree(model: DesignModel, filter: SidebarFilter = {}): SidebarNode[] {
	const q = (filter.query ?? '').trim().toLowerCase()
	const hidden = new Set(filter.hidden ?? [])
	const shown = allEntities(model).filter(
		(e) => !hidden.has(e.kind) && (!q || e.name.toLowerCase().includes(q))
	)
	const modules = (model.modules ?? []).map((m) => m.name)
	const rest = shown.filter((e) => !e.module || !modules.includes(e.module))

	const grouped = modules.flatMap((module) => {
		const members = shown.filter((e) => e.module === module)
		if (members.length === 0) return []
		return [group(`module:${module}`, module, DEFAULT_ICONS.database, bySchema(members, module))]
	})
	return [...grouped, ...bySchema(rest, '')]
}
