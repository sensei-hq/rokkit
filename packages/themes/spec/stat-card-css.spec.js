import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (p) => readFileSync(join(process.cwd(), 'packages/themes/src', p), 'utf-8')
const declarations = (p) => read(p).replace(/\/\*[\s\S]*?\*\//g, '')
const rulesFor = (file, selector) =>
	declarations(file)
		.split('}')
		.filter((rule) => rule.includes(selector))

const STYLES = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']

describe('stat card theme CSS', () => {
	it('is imported by base and by every style', () => {
		expect(read('base/index.css')).toContain('stat-card.css')
		for (const style of STYLES) {
			expect(read(`${style}/index.css`), style).toContain('stat-card.css')
		}
	})

	it('lays the card out in base: the icon and label on one line, the value below at the end', () => {
		expect(
			rulesFor('base/stat-card.css', '[data-stat-card] {').some((r) =>
				/flex-direction:\s*column/.test(r)
			)
		).toBe(true)
		expect(
			rulesFor('base/stat-card.css', '[data-stat-card-head]').some((r) => /display:\s*flex/.test(r))
		).toBe(true)
		expect(
			rulesFor('base/stat-card.css', '[data-stat-card-value] {').some((r) =>
				/align-self:\s*flex-end/.test(r)
			)
		).toBe(true)
		expect(
			rulesFor('base/stat-card.css', '[data-stat-cards]').some((r) => /display:\s*grid/.test(r))
		).toBe(true)
	})

	it('puts no colour in base — colour is each style’s', () => {
		const offenders = declarations('base/stat-card.css')
			.split('}')
			.filter((r) => /(^|[;{\s])(color|background-color|border-color):/.test(r))
		expect(offenders).toEqual([])
	})

	it.each(STYLES)('%s colours the card and each tone from tokens', (style) => {
		const css = declarations(`${style}/stat-card.css`)
		for (const hook of [
			'[data-stat-card]',
			'[data-stat-card-head]',
			'[data-stat-card-value]',
			"[data-stat-card][data-tone='danger']",
			"[data-stat-card][data-tone='warning']",
			"[data-stat-card][data-tone='success']",
			"[data-stat-card][data-tone='muted']"
		]) {
			expect(css, `${style} / ${hook}`).toContain(`[data-style='${style}'] ${hook}`)
		}
		expect(
			css.split('}').filter((r) => /#[0-9a-f]{3,8}\b|rgba?\(|oklch\(/i.test(r)),
			style
		).toEqual([])
	})
})
