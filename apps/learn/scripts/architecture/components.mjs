/**
 * Component-level tables for build-architecture-metrics.mjs: Martin's metrics per component,
 * component → component import counts, and co-change pairs from git history.
 */
import { round } from './measure.mjs'

const emptyComponent = (row) => ({
	component: row.component,
	package: row.package,
	files: 0,
	loc: 0,
	churn: 0,
	declarations: 0,
	abstract: 0,
	dependents: new Set(),
	dependers: new Set()
})

/** Module totals rolled up per component. */
function rollUp(modules) {
	const components = new Map()
	for (const row of modules) {
		const c = components.get(row.component) ?? emptyComponent(row)
		c.files++
		c.loc += row.loc
		c.churn += row.churn
		c.declarations += row.declarations
		c.abstract += row.abstract
		components.set(row.component, c)
	}
	return components
}

/** Each cross-component import as [importer file, importer component, imported component]. */
const crossImports = (imports, byId) =>
	imports
		.map(([from, to]) => [from, byId.get(from).component, byId.get(to).component])
		.filter(([, a, b]) => a !== b)

/** Instability, abstractness and distance from the main sequence for one component. */
function martinRow(c) {
	const ca = c.dependents.size
	const ce = c.dependers.size
	const instability = ca + ce === 0 ? null : ce / (ca + ce)
	const abstractness = c.declarations === 0 ? 0 : c.abstract / c.declarations
	return {
		component: c.component,
		package: c.package,
		files: c.files,
		loc: c.loc,
		churn: c.churn,
		ca,
		ce,
		instability: instability === null ? null : round(instability),
		abstractness: round(abstractness),
		distance: instability === null ? null : round(Math.abs(abstractness + instability - 1))
	}
}

export function componentRows(modules, imports, byId) {
	const components = rollUp(modules)
	// Ca: files OUTSIDE a component that import something inside it.
	// Ce: files INSIDE a component that import something outside it.
	for (const [from, a, b] of crossImports(imports, byId)) {
		components.get(b).dependents.add(from)
		components.get(a).dependers.add(from)
	}
	return (
		[...components.values()]
			.map(martinRow)
			// A component nothing touches and that touches nothing has no instability to plot.
			.filter((c) => c.instability !== null)
			.sort((a, b) => a.component.localeCompare(b.component))
	)
}

/** File-level imports counted per (component, component) pair, keyed `a\tb`. */
export function importCounts(imports, byId) {
	const counts = new Map()
	for (const [, a, b] of crossImports(imports, byId)) {
		const key = `${a}\t${b}`
		counts.set(key, (counts.get(key) ?? 0) + 1)
	}
	return counts
}

const pairRows = (counts) =>
	[...counts].map(([key, count]) => {
		const [source, target] = key.split('\t')
		return { source, target, count }
	})

export const importRows = (counts) =>
	pairRows(counts).sort((x, y) => x.source.localeCompare(y.source) || x.target.localeCompare(y.target))

// A commit that touches half the repo (a rename, a formatter run) couples everything with
// everything and says nothing, so only focused commits count.
const MAX_COMPONENTS_PER_COMMIT = 6
// The strongest pairs only — a demo overlay of every pair that ever co-occurred is a hairball.
const MIN_COCHANGES = 3

/** The known components one commit touched, sorted — or none when it is not a focused commit. */
function touchedBy(files, byId, known) {
	const touched = [...new Set(files.map((f) => byId.get(f)?.component).filter((c) => c && known.has(c)))].sort()
	return touched.length < 2 || touched.length > MAX_COMPONENTS_PER_COMMIT ? [] : touched
}

/** How many focused commits changed each pair of components together, keyed `a\tb`. */
function pairCounts(history, byId, known) {
	const counts = new Map()
	for (const files of history) {
		const touched = touchedBy(files, byId, known)
		touched.forEach((a, i) =>
			touched.slice(i + 1).forEach((b) => counts.set(`${a}\t${b}`, (counts.get(`${a}\t${b}`) ?? 0) + 1))
		)
	}
	return counts
}

export function cochangeRows(history, byId, components, imported) {
	const known = new Set(components.map((c) => c.component))
	const has = (a, b) => imported.has(`${a}\t${b}`) || imported.has(`${b}\t${a}`)
	return pairRows(pairCounts(history, byId, known))
		.filter((r) => r.count >= MIN_COCHANGES)
		.map((r) => ({ ...r, imported: has(r.source, r.target) }))
		.sort((x, y) => y.count - x.count || x.source.localeCompare(y.source))
}
