import { readPath } from './path.js'
import { BADGE_ORDER, num, pick, str } from './values.js'
import { buildEdge, buildNeighbors, markForeignKeys } from './edges.js'
import type { GraphEdge, GraphFields, GraphModel, GraphNode, GraphRow } from '../types.js'

export { buildNeighbors }

/**
 * Named quantities, keeping only the finite numbers — a measure is a quantity, and a string
 * or a NaN reaching a size calculation produces a card with no width at all.
 */
function measures(value: unknown): Record<string, number> | undefined {
	if (value === null || typeof value !== 'object') return undefined

	const out: Record<string, number> = {}
	for (const [key, raw] of Object.entries(value)) {
		const n = num(raw)
		if (n !== undefined) out[key] = n
	}

	return Object.keys(out).length > 0 ? out : undefined
}

/**
 * A containment path, from either an array or a delimited string.
 *
 * A file path arrives as `'src/lib/parse.ts'`; requiring every consumer to split it is asking
 * for the same three lines everywhere. Empty segments are dropped, so a leading, trailing or
 * doubled separator is harmless rather than producing a nameless container.
 */
function segments(value: unknown, delimiter: string): string[] | undefined {
	const raw = typeof value === 'string' ? value.split(delimiter) : value
	if (!Array.isArray(raw)) return undefined

	const parts = raw.filter((v): v is string => typeof v === 'string' && v.length > 0)

	return parts.length > 0 ? parts : undefined
}

function buildRows(source: unknown, fields: GraphFields): GraphRow[] {
	const raw = pick(source, fields.rows, 'rows')
	if (!Array.isArray(raw)) return []

	const badgePaths = fields.rowBadges ?? {}

	return raw.map((entry) => {
		const badges = BADGE_ORDER.filter((badge) => {
			const path = badgePaths[badge]
			return path ? Boolean(readPath(entry, path)) : false
		})

		return {
			name: String(pick(entry, fields.rowName, 'name') ?? ''),
			type: str(pick(entry, fields.rowType, 'type')),
			badges,
			note: str(pick(entry, fields.rowNote, 'note'))
		}
	})
}

// Every node-level field the canonical model reads. A claimed key must NOT also
// land in `meta`, or the same value sits in two places and the two can drift.
const CLAIMED_NODE_KEYS = [
	'id',
	'label',
	'group',
	'kind',
	'weight',
	'path',
	'measures',
	'rows',
	'note',
	'members',
	'collapsed',
	'layer',
	'parent'
] as const

function buildMeta(source: unknown, fields: GraphFields): Record<string, unknown> {
	if (source === null || typeof source !== 'object') return {}

	const claimed = new Set<string>()
	for (const key of CLAIMED_NODE_KEYS) {
		// Only the FIRST segment is claimed: a map of `from.t` claims `from`.
		claimed.add((fields[key] ?? key).split('.')[0])
	}

	const meta: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(source)) {
		if (!claimed.has(key)) meta[key] = value
	}

	return meta
}

function buildNode(source: unknown, fields: GraphFields): GraphNode {
	const label = String(pick(source, fields.label, 'label') ?? '')
	const group = str(pick(source, fields.group, 'group'))
	const explicitId = str(pick(source, fields.id, 'id'))

	return {
		id: explicitId ?? (group ? `${group}.${label}` : label),
		label,
		group,
		kind: str(pick(source, fields.kind, 'kind')),
		weight: num(pick(source, fields.weight, 'weight')),
		path: segments(pick(source, fields.path, 'path'), fields.pathDelimiter ?? '/'),
		measures: measures(pick(source, fields.measures, 'measures')),
		rows: buildRows(source, fields),
		note: str(pick(source, fields.note, 'note')),
		...nodeExtras(source, fields),
		meta: buildMeta(source, fields)
	}
}

/**
 * `members` / `collapsed` (#166) and `layer` (#167), added only when present — like the edge
 * extras, so every node a consumer already has stays key-for-key identical.
 */
function nodeExtras(
	source: unknown,
	fields: GraphFields
): Pick<GraphNode, 'members' | 'collapsed' | 'layer'> {
	const extras: Pick<GraphNode, 'members' | 'collapsed' | 'layer'> = {}
	const layer = num(pick(source, fields.layer, 'layer'))
	if (layer !== undefined) extras.layer = layer
	const members = pick(source, fields.members, 'members')
	if (Array.isArray(members)) extras.members = members.map(String)
	const collapsed = pick(source, fields.collapsed, 'collapsed')
	if (typeof collapsed === 'boolean') extras.collapsed = collapsed
	return extras
}

/** A node's ancestry as ids, root first and itself last — cut where a cycle closes. */
function chainOf(id: string, parentOf: Map<string, string | undefined>): string[] {
	const chain = [id]
	const seen = new Set(chain)
	let parent = parentOf.get(id)
	while (parent !== undefined && !seen.has(parent)) {
		chain.unshift(parent)
		seen.add(parent)
		// A parent that is not a node ends the walk: it is kept as the container it names.
		parent = parentOf.get(parent)
	}
	return chain
}

/**
 * Containment given as `parent` ids (#168) — the shape many hosts send — becomes a `path`.
 *
 * Only for a node with no `path` of its own, and only where the parent relation is in play: a
 * node that HAS a parent, or that another node names as one (so a root still heads the paths
 * of its children). Segments are node ids, since labels repeat across branches.
 */
function pathsFromParents(built: GraphNode[], sources: unknown[], fields: GraphFields): void {
	const parentOf = new Map<string, string | undefined>()
	built.forEach((node, i) => parentOf.set(node.id, str(pick(sources[i], fields.parent, 'parent'))))
	const named = new Set([...parentOf.values()].filter((p) => p !== undefined))
	for (const node of built) {
		if (node.path || (parentOf.get(node.id) === undefined && !named.has(node.id))) continue
		node.path = chainOf(node.id, parentOf)
	}
}

/**
 * Resolves a consumer's `nodes`/`edges`/`fields` into the canonical model — ONCE.
 * Everything downstream (layouts, routing, components) sees concrete types, so no
 * field mapping leaks past this function.
 */
export function normalizeGraph(
	nodes: unknown[],
	edges: unknown[],
	fields: GraphFields = {}
): GraphModel {
	const built = nodes.map((source) => buildNode(source, fields))
	pathsFromParents(built, nodes, fields)
	const byId = new Map(built.map((node) => [node.id, node]))

	const seen = new Map<string, number>()
	const resolved = edges
		.map((source) => buildEdge(source, fields, byId, seen))
		.filter((edge): edge is GraphEdge => edge !== null)

	const structural = resolved.filter((edge) => !edge.overlay)
	const overlays = resolved.filter((edge) => edge.overlay)
	markForeignKeys(byId, structural)

	return { nodes: built, edges: structural, overlays, byId, neighbors: buildNeighbors(structural) }
}
