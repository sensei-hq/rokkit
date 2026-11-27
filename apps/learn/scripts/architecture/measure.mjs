/**
 * Per-file measures and the repo history/coverage inputs for build-architecture-metrics.mjs.
 * Regex over source, deliberately — see the script's header for why that is good enough here.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const SOURCE = /\.(ts|js|svelte)$/
const IGNORE = /(node_modules|dist|\.svelte-kit|\.d\.ts$)/

/** Every source file under `dir`, skipping build output and declaration files. */
export function walk(dir, found = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry)
		if (IGNORE.test(full)) continue
		if (statSync(full).isDirectory()) walk(full, found)
		else if (SOURCE.test(full)) found.push(full)
	}
	return found
}

export const round = (n, places = 3) => Math.round(n * 10 ** places) / 10 ** places

/**
 * Decision points + 1 — an approximation of cyclomatic complexity. Counts branching keywords
 * and short-circuit operators; misses ternaries (a `?` is too ambiguous with optional
 * chaining and TS optional members to count by regex).
 */
export const complexityOf = (source) =>
	1 + (source.match(/\b(if|for|while|case|catch)\b|&&|\|\||\?\?/g) ?? []).length

/**
 * Exported declarations, split into abstract and concrete. A type, an interface, an abstract
 * class or a JSDoc `@typedef` is abstract — a contract with no behaviour; everything else a
 * module exports is concrete. A `.svelte` file is one concrete component.
 */
export function declarationsOf(name, source) {
	if (name.endsWith('.svelte')) return { total: 1, abstract: 0 }
	const typedefs = (source.match(/@typedef\b/g) ?? []).length
	const abstract = (source.match(/^\s*export\s+(declare\s+)?(type|interface|abstract\s+class)\b/gm) ?? []).length + typedefs
	const exported = (source.match(/^\s*export\s/gm) ?? []).length
	return { total: exported + typedefs, abstract }
}

const gitLog = (root, format) =>
	execFileSync('git', ['log', format, '--name-only', '--', 'packages'], {
		cwd: root,
		encoding: 'utf-8',
		maxBuffer: 256 * 1024 * 1024
	})

/** Commits touching each file, over the whole history of the repo. */
export function churnByFile(root) {
	const counts = new Map()
	for (const line of gitLog(root, '--format=').split('\n')) {
		if (line) counts.set(line, (counts.get(line) ?? 0) + 1)
	}
	return counts
}

/**
 * Files changed by each commit. Formatted with a marker line per commit so the name lists can
 * be split without guessing where one commit ends.
 */
export function commits(root) {
	return gitLog(root, '--format=tformat:@@commit')
		.split('@@commit')
		.map((block) => block.split('\n').filter(Boolean))
		.filter((files) => files.length > 0)
}

/** Statement coverage per repo-relative file, or an empty map when coverage has not run. */
export function coverageByFile(root, coverageFile) {
	if (!existsSync(coverageFile)) return new Map()
	const raw = JSON.parse(readFileSync(coverageFile, 'utf-8'))
	const out = new Map()
	for (const [abs, entry] of Object.entries(raw)) {
		const hits = Object.values(entry.s ?? {})
		if (hits.length === 0) continue
		out.set(relative(root, abs), hits.filter((h) => h > 0).length / hits.length)
	}
	return out
}
