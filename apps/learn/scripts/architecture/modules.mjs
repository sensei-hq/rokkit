/**
 * Source files as module rows, and the in-repo imports between them, for
 * build-architecture-metrics.mjs.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { complexityOf, declarationsOf, round, walk } from './measure.mjs'

/** Packages that have a `src/` folder — the only ones measured. */
export const packagesIn = (root) =>
	readdirSync(join(root, 'packages')).filter((p) => existsSync(join(root, 'packages', p, 'src')))

/** One row for a source file. `source` is kept only until imports are counted. */
function moduleRow(pkg, rel, source, { churn, coverage }) {
	const segments = rel.split('/')
	const name = segments[segments.length - 1]
	const id = `packages/${pkg}/src/${rel}`
	const decl = declarationsOf(name, source)
	return {
		id,
		label: name,
		package: pkg,
		component: segments.length > 1 ? `${pkg}/${segments[0]}` : pkg,
		loc: source.split('\n').length,
		complexity: complexityOf(source),
		churn: churn.get(id) ?? 0,
		coverage: coverage.has(id) ? round(coverage.get(id)) : null,
		declarations: decl.total,
		abstract: decl.abstract,
		fanIn: 0,
		fanOut: 0,
		source
	}
}

/** Every measured source file, as module rows in walk order. */
export function collectModules(root, history) {
	const modules = []
	for (const pkg of packagesIn(root)) {
		const src = join(root, 'packages', pkg, 'src')
		for (const file of walk(src)) {
			modules.push(moduleRow(pkg, relative(src, file), readFileSync(file, 'utf-8'), history))
		}
	}
	return modules
}

/**
 * Resolve a relative import to a file that exists.
 *
 * TypeScript source imports its siblings by their EMITTED name — `'../types/chat.js'` for
 * `chat.ts`, `'./config.svelte.js'` for `config.svelte.ts` — so a `.js` specifier is also tried
 * as `.ts`. Without that, 332 of 1090 relative imports in this repo went unresolved, which
 * zeroed `ui/types`' afferent coupling and invented co-change "hidden coupling" between modules
 * that plainly import each other.
 */
function resolveRelative(byId, fromId, spec) {
	const base = join(dirname(fromId), spec)
	const stems = base.endsWith('.js') ? [base, base.slice(0, -3) + '.ts'] : [base]
	for (const stem of stems) {
		for (const ext of ['', '.ts', '.js', '.svelte', '/index.ts', '/index.js']) {
			const candidate = (stem + ext).replace(/\/\.\//g, '/')
			if (byId.has(candidate)) return candidate
		}
	}
	return undefined
}

const entryOf = (byId, pkg) =>
	[`packages/${pkg}/src/index.ts`, `packages/${pkg}/src/index.js`].find((id) => byId.has(id))

/** The in-repo file an import specifier names: a relative path, or a `@rokkit/*` package entry. */
function targetOf(byId, fromId, spec) {
	if (spec.startsWith('.')) return resolveRelative(byId, fromId, spec)
	if (spec.startsWith('@rokkit/')) return entryOf(byId, spec.slice('@rokkit/'.length).split('/')[0])
	return undefined
}

/**
 * Resolved in-repo imports, de-duplicated per (importer, imported) pair. Counts each module's
 * fan-in and fan-out on the rows as it goes.
 */
export function resolveImports(modules, byId) {
	const imports = []
	const seen = new Set()
	for (const row of modules) {
		for (const match of row.source.matchAll(/from\s+'([^']+)'/g)) {
			const target = targetOf(byId, row.id, match[1])
			const key = `${row.id}->${target}`
			if (!target || target === row.id || seen.has(key)) continue
			seen.add(key)
			imports.push([row.id, target])
			row.fanOut++
			byId.get(target).fanIn++
		}
	}
	return imports
}

/** Module rows for the dataset: without their source text, sorted by id. */
export const moduleRows = (modules) =>
	modules
		.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'source')))
		.sort((a, b) => a.id.localeCompare(b.id))
