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

	it('lets a card span the grid columns it is given, and keeps a plain card plain', () => {
		const base = declarations('base/stat-card.css')
		expect(
			rulesFor('base/stat-card.css', '[data-stat-card][data-span]').some((r) =>
				/grid-column:\s*span var\(--stat-card-span\)/.test(r)
			)
		).toBe(true)
		expect(
			rulesFor('base/stat-card.css', '[data-stat-card-interactive]').some((r) =>
				/cursor:\s*pointer/.test(r)
			)
		).toBe(true)
		expect(
			rulesFor('base/stat-card.css', '[data-stat-card] {').some((r) => /cursor:\s*default/.test(r))
		).toBe(true)
		// A linked value covers its card, so the whole card is the link's target.
		expect(base).toMatch(/a\[data-stat-card-value\]::after\s*\{[^}]*inset:\s*0/)
	})

	it('keeps the description to two lines and reserves one, so a one-line card has no gap under it', () => {
		const description = rulesFor('base/stat-card.css', '[data-stat-card-description]').join('}')
		expect(description).toMatch(/-webkit-line-clamp:\s*2/)
		expect(description).toMatch(/min-height:\s*1rem/)
		expect(description).not.toMatch(/min-height:\s*calc\(2 \* /)
	})

	it('reads the value in the display font role, never a named face', () => {
		const value = rulesFor('base/stat-card.css', '[data-stat-card-value] {').join('}')
		expect(value).toMatch(/font-family:\s*var\(--font-display/)
		expect(value).toMatch(/font-size:\s*1\.5rem/)
		for (const style of ['base', ...STYLES]) {
			expect(declarations(`${style}/stat-card.css`), style).not.toMatch(/Fraunces|font-heading/i)
		}
	})

	it('sizes the card to the shell: pad 10/12, radius 10, gap 4, a 13px mark and icon', () => {
		const card = rulesFor('base/stat-card.css', '[data-stat-card] {').join('}')
		expect(card).toMatch(/padding:\s*0\.625rem 0\.75rem/)
		expect(card).toMatch(/border-radius:\s*0\.625rem/)
		expect(card).toMatch(/gap:\s*0\.25rem/)
		expect(has('base/stat-card.css', '[data-stat-card-icon]', /font-size:\s*0\.8125rem/)).toBe(true)
		expect(has('base/stat-card.css', '[data-stat-card-mark]', /font-size:\s*0\.8125rem/)).toBe(true)
	})

	it.each(STYLES)('%s reads the accent tone, and the icon in the card’s tone like its mark', (style) => {
		const css = declarations(`${style}/stat-card.css`)
		expect(css, style).toContain(
			`[data-style='${style}'] [data-stat-card][data-tone='accent'] [data-stat-card-value]`
		)
		for (const tone of ['accent', 'ink', 'danger', 'warning', 'success', 'muted']) {
			expect(css, `${style} / ${tone} icon`).toContain(
				`[data-style='${style}'] [data-stat-card][data-tone='${tone}'] [data-stat-card-icon]`
			)
		}
	})

	it('zen-sumi frames a card with the edge token and presses it onto the mute fill (user, 2026-11-14)', () => {
		const f = 'zen-sumi/stat-card.css'
		expect(
			has(f, "[data-style='zen-sumi'] [data-stat-card] {", /border-color:\s*var\(--paper-edge\)/)
		).toBe(true)
		expect(declarations(f)).not.toMatch(/color-mix/)
		expect(
			has(f, "[data-stat-card][aria-pressed='true']", /background-color:\s*var\(--paper-mute\)/)
		).toBe(true)
	})

	it.each(STYLES)('%s colours the mark, the description, hover and the pressed state', (style) => {
		const css = declarations(`${style}/stat-card.css`)
		for (const hook of [
			'[data-stat-card-mark]',
			'[data-stat-card-description]',
			'[data-stat-card-interactive]:hover',
			"[data-stat-card][aria-pressed='true']"
		]) {
			expect(css, `${style} / ${hook}`).toContain(`[data-style='${style}'] ${hook}`)
		}
	})
})
