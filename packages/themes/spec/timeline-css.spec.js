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

describe('timeline theme CSS: a toned dot on one line', () => {
	it('base draws the dot small and centred on its column', () => {
		const f = 'base/timeline.css'
		const dot = "[data-timeline][data-marker='dot'] [data-timeline-circle]"
		expect(has(f, dot, /width:\s*0\.75rem/)).toBe(true)
		expect(has(f, dot, /height:\s*0\.75rem/)).toBe(true)
		expect(has(f, "[data-timeline][data-marker='dot'] [data-timeline-item]", /grid-template-columns:\s*0\.75rem/)).toBe(true)
	})

	it('base runs the line from one dot to the next, through the gap between items', () => {
		const f = 'base/timeline.css'
		const line = "[data-timeline][data-marker='dot'] [data-timeline-connector]"
		expect(has(f, line, /position:\s*absolute/)).toBe(true)
		expect(has(f, line, /left:\s*50%/)).toBe(true)
		expect(has(f, line, /bottom:\s*calc\(/)).toBe(true)
	})

	it('base lets the space between items be set', () => {
		expect(has('base/timeline.css', '[data-timeline-body]', /padding-bottom:\s*var\(--timeline-gap/)).toBe(true)
	})

	it('base keeps colour out: each style colours its tones', () => {
		const offenders = rulesFor('base/timeline.css', '[data-tone').filter((r) =>
			/(^|[;{\s])(color|background-color|border-color):/.test(r)
		)
		expect(offenders).toEqual([])
	})

	it.each(STYLES)('%s rings the node in every tone, from tokens', (style) => {
		const css = declarations(`${style}/timeline.css`)
		for (const tone of TONES) {
			expect(css, `${style} / ${tone}`).toContain(
				`[data-style='${style}'] [data-timeline-item][data-tone='${tone}'] [data-timeline-circle]`
			)
		}
		expect(css, style).toContain(`[data-style='${style}'] [data-timeline][data-marker='dot'] [data-timeline-circle]`)
		expect(css.split('}').filter((r) => /#[0-9a-f]{3,8}\b|rgba?\(|oklch\(/i.test(r)), style).toEqual([])
	})
})
