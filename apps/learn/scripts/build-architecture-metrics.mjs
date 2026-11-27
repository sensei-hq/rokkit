#!/usr/bin/env node
/**
 * Generate the architecture-metrics dataset for the chart demo's Architecture recipes, from
 * THIS repo — Robert Martin's main sequence, hotspots, complexity × coverage, fan-in × fan-out
 * and the god-module region all plot real numbers about rokkit, not invented ones.
 *
 * Two tables:
 *
 * - `components` — one row per COMPONENT, Martin's unit: a top-level folder under a package's
 *   `src/` (`chart/geoms`, `ui/components`), or the package root for files sitting directly
 *   in `src/`. Instability and abstractness are defined per component, not per file; at file
 *   level most points land exactly on (0,0) or (1,0) and the picture is noise.
 * - `modules` — one row per source file, for the charts whose unit IS the file.
 * - `imports` — component → component, with the number of file-level imports behind it. The
 *   dependency matrix reads these.
 * - `cochange` — component pairs that change in the SAME commit, counted over history, and
 *   whether an import joins them. A pair that changes together with no import between them is
 *   hidden coupling — the edge the graph demo overlays without letting it shape the layout.
 *
 * Deliberately regex over source, like `build-codebase-graph.mjs` beside it: a missed import
 * or a miscounted branch costs a dot in a demo, not a wrong answer in a product. If this ever
 * informs a real decision, parse it properly.
 *
 * Coverage comes from `coverage/coverage-final.json`, so run `bun run coverage` first; without
 * it `coverage` is null and the coverage recipe says so rather than plotting zeros.
 *
 * Output is committed so the demo needs no scan and works offline. Re-run with:
 *   bun run coverage && node apps/learn/scripts/build-architecture-metrics.mjs
 */
import { writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { churnByFile, commits, coverageByFile } from './architecture/measure.mjs'
import { collectModules, moduleRows, resolveImports } from './architecture/modules.mjs'
import { cochangeRows, componentRows, importCounts, importRows } from './architecture/components.mjs'

const ROOT = resolve(import.meta.dirname, '../../..')
const OUT = join(ROOT, 'apps/learn/src/lib/koan/demos/chart/architecture.json')
const COVERAGE = join(ROOT, 'coverage/coverage-final.json')

const coverage = coverageByFile(ROOT, COVERAGE)
const modules = collectModules(ROOT, { churn: churnByFile(ROOT), coverage })
const byId = new Map(modules.map((row) => [row.id, row]))
const imports = resolveImports(modules, byId)

const components = componentRows(modules, imports, byId)
const counts = importCounts(imports, byId)
const importTable = importRows(counts)
const cochange = cochangeRows(commits(ROOT), byId, components, counts)
const moduleTable = moduleRows(modules)

writeFileSync(
	OUT,
	JSON.stringify(
		{
			generated: 'node apps/learn/scripts/build-architecture-metrics.mjs',
			coverage: coverage.size > 0,
			components,
			modules: moduleTable,
			imports: importTable,
			cochange
		},
		null,
		'\t'
	) + '\n'
)

console.log(
	`architecture.json: ${components.length} components, ${moduleTable.length} modules, ` +
		`${importTable.length} component imports, ${cochange.length} co-change pairs ` +
		`(${cochange.filter((r) => !r.imported).length} with no import), ` +
		`${imports.length} imports, coverage ${coverage.size > 0 ? 'included' : 'ABSENT — run bun run coverage'}`
)
