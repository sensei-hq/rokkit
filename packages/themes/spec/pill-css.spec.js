import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (p) => readFileSync(join(process.cwd(), 'packages/themes/src', p), 'utf-8')
const declarations = (p) => read(p).replace(/\/\*[\s\S]*?\*\//g, '')
const rulesFor = (file, selector) =>
	declarations(file)
		.split('}')
		.filter((rule) => rule.includes(selector))
const has = (file, selector, pattern) => rulesFor(file, selector).some((r) => pattern.test(r))

const STYLES = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']
const TONES = ['accent', 'success', 'warning', 'danger', 'neutral']

describe('pill theme CSS: a status chip', () => {
	it('base sizes a small pill and draws an outline pill with no fill', () => {
		const f = 'base/pill.css'
		expect(has(f, "[data-pill][data-size='sm']", /font-size:\s*0\.75rem/)).toBe(true)
		expect(has(f, "[data-pill][data-size='sm']", /min-height:\s*0/)).toBe(true)
		expect(has(f, "[data-pill][data-variant='outline']", /border:\s*1px solid/)).toBe(true)
		expect(has(f, "[data-pill][data-variant='outline']", /background(-color)?:\s*transparent/)).toBe(true)
	})

	it('base keeps colour out: each style colours its tones', () => {
		const offenders = rulesFor('base/pill.css', '[data-tone').filter((r) => /(^|[;{\s])(color|background-color|border-color):/.test(r))
		expect(offenders).toEqual([])
	})

	it.each(STYLES)('%s tints every tone from tokens: the tone over the paper, its border stronger', (style) => {
		const css = declarations(`${style}/pill.css`)
		for (const tone of TONES) {
			expect(css, `${style} / ${tone}`).toContain(`[data-style='${style}'] [data-pill][data-tone='${tone}']`)
		}
		expect(css.split('}').filter((r) => /#[0-9a-f]{3,8}\b|rgba?\(|oklch\(/i.test(r)), style).toEqual([])
	})
})

describe('toolbar separator', () => {
	it('zen-sumi draws the separator in the strong edge, not the faint mute fill (user, 2026-11-14)', () => {
		const f = 'zen-sumi/toolbar.css'
		expect(has(f, "[data-style='zen-sumi'] [data-toolbar-separator]", /background-color:\s*var\(--paper-edge-strong\)/)).toBe(true)
		expect(has(f, "[data-style='zen-sumi'] [data-toolbar-separator]", /bg-paper-mute/)).toBe(false)
	})
})
