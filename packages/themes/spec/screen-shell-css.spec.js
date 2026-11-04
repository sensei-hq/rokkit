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
const ROLES = ['accent', 'primary', 'secondary', 'info', 'success', 'warning', 'danger']

describe('screen shell theme CSS', () => {
	it('is imported by base and by every style', () => {
		expect(read('base/index.css')).toContain('screen-shell.css')
		for (const style of STYLES)
			expect(read(`${style}/index.css`), style).toContain('screen-shell.css')
	})

	it('fills its container, and only the body and the sidebar scroll', () => {
		const f = 'base/screen-shell.css'
		expect(has(f, '[data-screen-shell] {', /height:\s*100%/)).toBe(true)
		expect(has(f, '[data-screen-shell] {', /min-height:\s*0/)).toBe(true)
		expect(has(f, '[data-screen-shell] {', /overflow:\s*hidden/)).toBe(true)
		expect(has(f, '[data-screen-main] {', /min-height:\s*0/)).toBe(true)
		expect(has(f, '[data-screen-body] {', /overflow:\s*auto/)).toBe(true)
		expect(has(f, '[data-screen-sidebar] {', /overflow:\s*auto/)).toBe(true)
		const scrolling = declarations(f)
			.split('}')
			.filter((r) => /overflow(-[xy])?:\s*(auto|scroll)/.test(r))
			.map((r) => r.split('{')[0].trim())
		expect(scrolling.sort()).toEqual(['[data-screen-body]', '[data-screen-sidebar]'])
	})

	it('lays the stats on a 12-column grid whose rows share one height, two per row when narrow', () => {
		const f = 'base/screen-shell.css'
		expect(
			has(f, '[data-screen-stats] {', /grid-template-columns:\s*repeat\(12, minmax\(0, 1fr\)\)/)
		).toBe(true)
		expect(has(f, '[data-screen-stats] {', /grid-auto-rows:\s*1fr/)).toBe(true)
		expect(declarations(f)).toMatch(
			/@media \(max-width: 640px\)[\s\S]*?\[data-screen-stats\] \[data-stat-card\][\s\S]*?grid-column:\s*span 6/
		)
	})

	it('lays the info band out in three columns, the third after a hairline', () => {
		const f = 'base/screen-shell.css'
		expect(has(f, '[data-screen-info] {', /grid-template-columns:/)).toBe(true)
		expect(
			has(f, '[data-screen-info-column]:nth-child(3)', /border-inline-start-width:\s*1px/)
		).toBe(true)
	})

	it('sizes the search as the filters band’s first control, and draws no title-bar separator for it', () => {
		const f = 'base/screen-shell.css'
		expect(has(f, '[data-screen-filters] [data-screen-search]', /flex:\s*0 1 16rem/)).toBe(true)
		for (const file of ['base', ...STYLES].map((x) => `${x}/screen-shell.css`))
			expect(declarations(file), file).not.toContain('[data-screen-search] + [data-toolbar]')
	})

	it('maps each info role to its token', () => {
		for (const role of ROLES)
			expect(
				has(
					'base/screen-shell.css',
					`[data-screen-info][data-role='${role}']`,
					new RegExp(`--screen-role:\\s*var\\(--${role}\\)`)
				),
				role
			).toBe(true)
	})

	it('puts no colour in base — colour is each style’s', () => {
		const offenders = declarations('base/screen-shell.css')
			.split('}')
			.filter((r) => /(^|[;{\s])(color|background-color|border-color|background):/.test(r))
		expect(offenders).toEqual([])
	})

	it.each(STYLES)(
		'%s washes the info band with its role over paper, 12%% by day and 18%% by night',
		(style) => {
			const f = `${style}/screen-shell.css`
			const css = declarations(f)
			expect(css).toMatch(
				new RegExp(
					`\\[data-style='${style}'\\] \\[data-screen-info\\] \\{[^}]*background-color:\\s*color-mix\\(in oklch, var\\(--screen-role\\) var\\(--screen-wash\\), var\\(--paper\\)\\)`
				)
			)
			expect(css).toMatch(
				new RegExp(
					`\\[data-style='${style}'\\] \\[data-screen-info\\] \\{[^}]*--screen-wash:\\s*12%`
				)
			)
			expect(css).toMatch(
				new RegExp(
					`\\[data-mode='dark'\\] \\[data-style='${style}'\\] \\[data-screen-info\\][\\s\\S]*?--screen-wash:\\s*18%`
				)
			)
			expect(css).toMatch(
				new RegExp(`\\[data-style='${style}'\\]\\[data-mode='dark'\\] \\[data-screen-info\\]`)
			)
		}
	)

	it.each(STYLES)(
		'%s colours every part from tokens, raw colours only as color-mix of tokens',
		(style) => {
			const css = declarations(`${style}/screen-shell.css`)
			for (const hook of [
				'[data-screen-shell]',
				'[data-screen-header]',
				'[data-screen-mark]',
				'[data-screen-title]',
				'[data-screen-context]',
				'[data-screen-description]',
				'[data-screen-search]',
				'[data-screen-info-label]',
				'[data-screen-info-mark]',
				'[data-screen-info-title]',
				'[data-screen-info-text]',
				'[data-screen-info-step-seal]',
				'[data-screen-info-value]',
				'[data-screen-info-meter]',
				'[data-screen-stats]',
				'[data-screen-filters]',
				'[data-screen-filter-chip]',
				'[data-screen-sidebar]',
				'[data-screen-footer]'
			]) {
				expect(css, `${style} / ${hook}`).toContain(`[data-style='${style}'] ${hook}`)
			}
			expect(
				css
					.split('}')
					.filter((r) => /#[0-9a-f]{3,8}\b|rgba?\(|(?<!color-mix\(in )oklch\(/i.test(r)),
				style
			).toEqual([])
			expect(css, 'text on the wash stays ink').toMatch(
				new RegExp(
					`\\[data-style='${style}'\\] \\[data-screen-info-text\\] \\{[^}]*color:\\s*var\\(--ink-soft\\)`
				)
			)
		}
	)
})
