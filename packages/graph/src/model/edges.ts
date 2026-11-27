/**
 * The edge half of `normalizeGraph`: endpoint resolution, edge ids, the derived `fk` badge and
 * the neighbour index. Split from normalize.ts so each file stays one concern.
 */
import { readPath } from './path.js'
import { BADGE_ORDER, num, pick, str } from './values.js'
import type { Conformance, EdgeKind, GraphEdge, GraphFields, GraphNode, GraphRow } from '../types.js'

/**
 * Resolves an edge endpoint to a node id.
 *
 * Exactly two strategies, both explicit:
 *   1. the raw value already IS a node id
 *   2. `${group}.${raw}` where the group comes from a DECLARED path
 *
 * There is deliberately no third "try every sibling field and take the first hit"
 * fallback. That shape guesses: for `{ from: { s: 'staging', t: 'orders', c: 'legacy' } }`
 * where `staging.orders` does not exist but `legacy.orders` does, it would resolve the
 * endpoint to `legacy.orders` — silently drawing a relationship between two entities
 * that have none. An unresolvable endpoint stays unresolved rather than landing on a
 * coincidental match; `resolveEndpoints` then marks the edge unplaced and keeps it.
 */
type EndpointSpec = {
	/** Mapped path to the endpoint value on the edge source. */
	path: string | undefined
	/** Canonical key used when the map omits `path`. */
	fallbackKey: string
	/** Declared path to the endpoint's group, or undefined when none is declared. */
	groupPath: string | undefined
}

function resolveEndpoint(
	source: unknown,
	spec: EndpointSpec,
	byId: Map<string, GraphNode>
): string | undefined {
	const raw = str(pick(source, spec.path, spec.fallbackKey))
	if (raw === undefined) return undefined
	if (byId.has(raw)) return raw

	const group = spec.groupPath ? str(readPath(source, spec.groupPath)) : undefined
	if (group && byId.has(`${group}.${raw}`)) return `${group}.${raw}`

	return undefined
}

/**
 * Both endpoints, each flagged when the map could not resolve it to a node.
 *
 * Deliberately NOT "resolve or drop". Refusing to GUESS is still right — see resolveEndpoint
 * — but discarding is a different decision, and a wrong one: an endpoint that cannot be
 * placed is the normal case at scale, and dropping the edge hides that the relationship
 * exists at all.
 */
function resolveEndpoints(
	source: unknown,
	fields: GraphFields,
	byId: Map<string, GraphNode>
): { from: string; to: string; unplaced?: 'source' | 'target' | 'both' } | null {
	const from = resolveEndpoint(
		source,
		{
			path: fields.source,
			fallbackKey: 'source',
			groupPath: fields.sourceGroup ?? fields.group
		},
		byId
	)
	const to = resolveEndpoint(
		source,
		{
			path: fields.target,
			fallbackKey: 'target',
			groupPath: fields.targetGroup ?? fields.group
		},
		byId
	)

	// The raw value is kept when it does not resolve, so an unplaced edge still carries the
	// name written at the use site rather than becoming anonymous.
	const rawFrom = str(pick(source, fields.source, 'source'))
	const rawTo = str(pick(source, fields.target, 'target'))
	if (rawFrom === undefined || rawTo === undefined) return null

	return { from: from ?? rawFrom, to: to ?? rawTo, unplaced: whichUnplaced(from, to) }
}

/** Which end (if either) the map could not resolve. */
function whichUnplaced(
	from: string | undefined,
	to: string | undefined
): 'source' | 'target' | 'both' | undefined {
	if (from && to) return undefined
	if (!from && !to) return 'both'
	return from ? 'target' : 'source'
}

/**
 * Makes `base` unique within one normalize pass.
 *
 * `kind` is already in `base`, and this counter breaks the remaining ties. Endpoints plus row
 * names are NOT unique on their own: two dependency edges between the same pair (a procedure
 * calling a function twice, a view reaching a table by two paths) carry no row anchors at all,
 * so they would both key as `a:->b:`. A duplicate id silently breaks every id-keyed use —
 * `{#each … as e (e.id)}` first among them.
 */
function uniqueEdgeId(base: string, seen: Map<string, number>): string {
	const seq = seen.get(base) ?? 0
	seen.set(base, seq + 1)

	return seq === 0 ? base : `${base}#${seq}`
}

/**
 * The coarse edge kind: what the row declares, else the map's default, else a reference.
 *
 * Only the two canonical values are accepted from the data. A row carrying dbd v2's verb
 * (`reads`) would otherwise fall through to `reference` and draw a view's dependency as a
 * foreign key — which is why `defaultEdgeKind` exists for a list that is wholly one kind.
 */
function edgeKindOf(source: unknown, fields: GraphFields): EdgeKind {
	const declared = str(pick(source, fields.edgeKind, 'kind'))
	if (declared === 'dependency' || declared === 'reference') return declared

	return fields.defaultEdgeKind ?? 'reference'
}

export function buildEdge(
	source: unknown,
	fields: GraphFields,
	byId: Map<string, GraphNode>,
	seen: Map<string, number>
): GraphEdge | null {
	const endpoints = resolveEndpoints(source, fields, byId)
	if (!endpoints) return null

	const { from, to, unplaced } = endpoints
	const sourceRow = str(pick(source, fields.sourceRow, 'sourceRow'))
	const targetRow = str(pick(source, fields.targetRow, 'targetRow'))
	const kind = edgeKindOf(source, fields)
	const relation = str(pick(source, fields.relation, 'relation'))

	// `relation` joins the id because it is what separates otherwise-identical edges: a
	// procedure that both reads AND writes one table produces two dep edges with the same
	// endpoints and no row anchors, which would key identically and lose one to `{#each}`.
	//
	// Appended only when present, so every edge id a v1 consumer already has stays
	// byte-identical — these are `{#each}` keys, and churning them relayouts for no reason.
	const verb = relation ? `${kind}/${relation}` : kind
	const base = `${verb}:${from}:${sourceRow ?? ''}->${to}:${targetRow ?? ''}`

	return {
		id: uniqueEdgeId(base, seen),
		source: from,
		target: to,
		sourceRow,
		targetRow,
		kind,
		relation,
		cardinality: str(pick(source, fields.cardinality, 'cardinality')),
		action: str(pick(source, fields.action, 'action')),
		unplaced,
		...edgeExtras(source, fields)
	}
}

/**
 * `overlay` and `weight`, added only when present so every edge a v1 consumer already has
 * stays key-for-key identical — `toEqual` on an edge is a contract downstream specs rely on.
 */
const CONFORMANCE = new Set<Conformance>(['down', 'skip', 'up', 'level'])

function edgeExtras(
	source: unknown,
	fields: GraphFields
): Pick<GraphEdge, 'overlay' | 'weight' | 'weakest' | 'hidden' | 'conformance'> {
	const extras: Pick<GraphEdge, 'overlay' | 'weight' | 'weakest' | 'hidden' | 'conformance'> = {}
	// Only the vocabulary — an unknown word would be a style hook no theme knows.
	const conformance = str(pick(source, fields.conformance, 'conformance'))
	if (conformance && CONFORMANCE.has(conformance as Conformance)) extras.conformance = conformance as Conformance
	if (pick(source, fields.overlay, 'overlay')) extras.overlay = true
	if (pick(source, fields.weakest, 'weakest')) extras.weakest = true
	if (pick(source, fields.hidden, 'hidden')) extras.hidden = true
	const weight = num(pick(source, fields.edgeWeight, 'weight'))
	if (weight !== undefined) extras.weight = weight
	return extras
}

/**
 * The source row an edge makes a foreign key, if any.
 *
 * An unplaced TARGET still qualifies — the reference is real, only its destination is
 * unknown. An unplaced SOURCE has no row to mark.
 */
function foreignKeyRow(byId: Map<string, GraphNode>, edge: GraphEdge): GraphRow | undefined {
	if (edge.unplaced === 'source' || edge.unplaced === 'both') return undefined
	if (edge.kind !== 'reference' || !edge.sourceRow) return undefined

	return byId.get(edge.source)?.rows.find((r) => r.name === edge.sourceRow)
}

/** Adds the derived `fk` badge to each reference edge's source row. */
export function markForeignKeys(byId: Map<string, GraphNode>, edges: GraphEdge[]): void {
	for (const edge of edges) {
		const row = foreignKeyRow(byId, edge)
		if (row && !row.badges.includes('fk')) {
			row.badges = BADGE_ORDER.filter((b) => b === 'fk' || row.badges.includes(b))
		}
	}
}

export function buildNeighbors(edges: GraphEdge[]): Map<string, Set<string>> {
	const neighbors = new Map<string, Set<string>>()

	const link = (a: string, b: string) => {
		const set = neighbors.get(a) ?? new Set<string>()
		set.add(b)
		neighbors.set(a, set)
	}

	for (const edge of edges) {
		// An unplaced endpoint is not a node, so it cannot be a neighbour. `related` and the
		// dim/highlight states must only ever name things the reader can actually click.
		if (edge.unplaced || edge.source === edge.target) continue
		link(edge.source, edge.target)
		link(edge.target, edge.source)
	}

	return neighbors
}
