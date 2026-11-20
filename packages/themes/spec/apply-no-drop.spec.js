import { describe, it, expect } from 'vitest'
import { createGenerator, presetWind3, transformerDirectives } from 'unocss'
import { Theme } from '@rokkit/core'
import { buildNamedShortcuts } from '@rokkit/unocss'
import MagicString from 'magic-string'
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

/**
 * @apply no-drop guard.
 *
 * UnoCSS 66's transformerDirectives drops a `color` declaration when an
 * EARLIER utility in the same @apply expands to the same value: `@apply
 * bg-primary text-primary` compiles to background-color alone, and `@apply
 * border-primary text-primary` to border-color alone (reversed order keeps
 * both; different values are unaffected). The Oct-28 toolchain kept both, so
 * the Kit 3 migration silently changed every same-token bg/border+text pair —
 * outline buttons lost their coloured text across four styles, and material's
 * same-role fills fell back to inherited text. Found via the state-snapshot
 * drift (658 keys, Nov 2026).
 *
 * This spec expands every @apply body in themes src through the SAME pipeline
 * build.mjs uses and asserts no plain utility's declarations are lost. Fix a
 * failure by giving the text a DIFFERENT value — text-on-{role} on a filled
 * element (repo principle), text-first reordering otherwise — never by
 * re-merging the utilities.
 */

// vitest may run with cwd at the repo root or the themes project root — handle both.
const srcDir = [resolve(process.cwd(), 'src'), resolve(process.cwd(), 'packages/themes/src')].find(
	existsSync
)

const theme = new Theme()
const uno = await createGenerator({
	presets: [
		presetWind3({
			dark: { light: '[data-mode="light"]', dark: '[data-mode="dark"]' }
		})
	],
	shortcuts: [
		...theme.getShortcuts('surface'),
		...theme.getShortcuts('primary'),
		...theme.getShortcuts('secondary'),
		...theme.getShortcuts('accent'),
		...theme.getShortcuts('success'),
		...theme.getShortcuts('warning'),
		...theme.getShortcuts('danger'),
		...theme.getShortcuts('error'),
		...theme.getShortcuts('info'),
		...buildNamedShortcuts()
	],
	theme: { colors: theme.getColorRules() }
})
const transformer = transformerDirectives()

const expandCache = new Map()
async function expand(apply) {
	const hit = expandCache.get(apply)
	if (hit) return hit
	const s = new MagicString(`.x { @apply ${apply}; }`)
	await transformer.transform(s, 'test.css', {
		uno,
		tokens: new Set(),
		generate: async (tokens) => uno.generate(tokens, { preflights: false })
	})
	const decls = s
		.toString()
		.replace(/^[^{]*\{/, '')
		.replace(/\}\s*$/, '')
		.split(';')
		.map((d) => d.trim())
		.filter(Boolean)
	expandCache.set(apply, decls)
	return decls
}

const norm = (d) => d.replace(/\s+/g, '')

function cssFiles(dir) {
	const out = []
	for (const f of readdirSync(dir)) {
		const p = join(dir, f)
		if (statSync(p).isDirectory()) out.push(...cssFiles(p))
		else if (f.endsWith('.css')) out.push(p)
	}
	return out
}

function applyBodies() {
	const out = []
	for (const file of cssFiles(srcDir)) {
		const raw = readFileSync(file, 'utf-8')
		// Blank comments length-preservingly so match offsets still map to raw lines.
		const content = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
		for (const m of content.matchAll(/@apply\s+([^;]+);/g)) {
			const line = content.slice(0, m.index).split('\n').length
			out.push({ file: file.slice(srcDir.length + 1), line, body: m[1].replace(/\s+/g, ' ').trim() })
		}
	}
	return out
}

describe('@apply loses no declarations', () => {
	it("every plain utility's declarations survive combined expansion", async () => {
		const drops = []
		const seen = new Set()
		for (const { file, line, body } of applyBodies()) {
			const utils = body.split(/\s+/)
			if (utils.length < 2 || seen.has(body)) continue
			seen.add(body)
			const full = new Set((await expand(body)).map(norm))
			for (const u of utils) {
				// Variants (hover:, dark:, ...) expand to nested selectors that a
				// flat declaration comparison cannot judge.
				if (u.includes(':')) continue
				for (const d of await expand(u)) {
					// Unknown-alone utilities (gradient from-*/to-* stops) pass
					// through unexpanded; nothing to compare.
					if (d.includes('@apply')) continue
					if (!full.has(norm(d))) drops.push(`${file}:${line} [${body}] loses ${d} (from ${u})`)
				}
			}
		}
		expect(drops).toEqual([])
	}, 120_000)
})
