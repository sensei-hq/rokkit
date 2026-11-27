// @vitest-environment node
/* Characterization: build-architecture-metrics.mjs end to end, over a small virtual repo.
 *
 * The script reads the tree, git history and coverage through node:fs / node:child_process
 * and writes one JSON file, so both are replaced here: a fixed tree and fixed logs in, the
 * dataset it would have written out. Splitting the script into modules must not change it.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../../../..')

const FILES: Record<string, string> = {
	'packages/alpha/src/index.ts': "export * from './util.js'\nexport type A = string\n",
	'packages/alpha/src/util.ts':
		"import { b } from '@rokkit/beta'\nimport { h } from './parts/helper.js'\nexport function u(x) {\n\tif (x && b) return 1\n\treturn h ?? 2\n}\n",
	'packages/alpha/src/parts/Widget.svelte': "<script>\n\timport { u } from '../util.js'\n</script>\n",
	'packages/alpha/src/parts/helper.js': '/** @typedef {string} H */\nexport const h = 1\n',
	'packages/alpha/src/parts/README.md': 'not source',
	'packages/beta/src/index.ts':
		"import { u } from '@rokkit/alpha'\nexport const b = true\nexport interface I {}\nexport abstract class Base {}\n",
	'packages/beta/src/types.d.ts': 'export type Ignored = 1\n',
	'packages/beta/src/node_modules/dep.ts': 'export const ignored = 1\n',
	'packages/beta/src/lone/orphan.ts': "import { x } from './missing'\nexport const orphan = 1\n",
	'packages/gamma/package.json': '{}',
	'coverage/coverage-final.json': JSON.stringify({
		[join(ROOT, 'packages/alpha/src/util.ts')]: { s: { 0: 3, 1: 0, 2: 1 } },
		[join(ROOT, 'packages/beta/src/index.ts')]: { s: {} }
	})
}

const abs = (rel: string) => join(ROOT, rel)
const files = new Map(Object.entries(FILES).map(([rel, text]) => [abs(rel), text]))
const isDir = (path: string) => [...files.keys()].some((f) => f.startsWith(`${path}/`))

const CHURN_LOG = [
	'packages/alpha/src/util.ts',
	'packages/alpha/src/util.ts',
	'packages/beta/src/index.ts',
	''
].join('\n')
const COMMIT = '@@commit\n\npackages/alpha/src/util.ts\npackages/beta/src/index.ts\n'
const COMMITS_LOG = `${COMMIT.repeat(3)  }@@commit\n\npackages/alpha/src/parts/helper.js\npackages/beta/src/lone/orphan.ts\n`

const written: { path?: string; text?: string } = {}

vi.mock('node:fs', () => ({
	readFileSync: (path: string) => {
		if (!files.has(path)) throw new Error(`ENOENT ${path}`)
		return files.get(path)
	},
	writeFileSync: (path: string, text: string) => {
		written.path = path
		written.text = text
	},
	existsSync: (path: string) => files.has(path) || isDir(path),
	readdirSync: (dir: string) => [
		...new Set(
			[...files.keys()].filter((f) => f.startsWith(`${dir}/`)).map((f) => f.slice(dir.length + 1).split('/')[0])
		)
	],
	statSync: (path: string) => ({ isDirectory: () => isDir(path) })
}))

vi.mock('node:child_process', () => ({
	execFileSync: (_cmd: string, args: string[]) => (args.includes('--format=') ? CHURN_LOG : COMMITS_LOG)
}))

let dataset: Record<string, unknown>
let logged: string

beforeAll(async () => {
	const log = vi.spyOn(console, 'log').mockImplementation(() => {})
	await import('../../scripts/build-architecture-metrics.mjs')
	logged = String(log.mock.calls[0]?.[0])
	log.mockRestore()
	dataset = JSON.parse(written.text ?? 'null')
})

describe('build-architecture-metrics', () => {
	it('writes the chart demo’s architecture.json', () => {
		expect(written.path).toBe(abs('apps/learn/src/lib/koan/demos/chart/architecture.json'))
		expect(written.text?.endsWith('}\n')).toBe(true)
		expect(written.text).toContain('\n\t"generated"')
	})

	it('measures each source file, skipping ignored paths and non-source files', () => {
		const modules = dataset.modules as Array<Record<string, unknown>>
		expect(modules.map((m) => m.id)).toEqual([
			'packages/alpha/src/index.ts',
			'packages/alpha/src/parts/helper.js',
			'packages/alpha/src/parts/Widget.svelte',
			'packages/alpha/src/util.ts',
			'packages/beta/src/index.ts',
			'packages/beta/src/lone/orphan.ts'
		])
		expect(modules.find((m) => m.id === 'packages/alpha/src/util.ts')).toEqual({
			id: 'packages/alpha/src/util.ts',
			label: 'util.ts',
			package: 'alpha',
			component: 'alpha',
			loc: 7,
			complexity: 4,
			churn: 2,
			coverage: 0.667,
			declarations: 1,
			abstract: 0,
			fanIn: 2,
			fanOut: 2
		})
	})

	it('is the same dataset, field for field', () => {
		expect(dataset).toMatchSnapshot()
	})

	it('reports what it wrote', () => {
		expect(logged).toMatchSnapshot()
	})
})
