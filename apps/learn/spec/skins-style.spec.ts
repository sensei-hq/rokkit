/* Characterization: the CSS `applyRoleColor` writes into its <style> element. Overrides
 * accumulate in module state, so each case loads a fresh copy of the module and a clean head.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

type Skins = typeof import('../src/lib/data/skins.js')
let skins: Skins

const css = () => document.getElementById('koan-skin-overrides')?.textContent ?? null

beforeEach(async () => {
	document.head.replaceChildren()
	vi.resetModules()
	skins = await import('../src/lib/data/skins.js')
})

describe('applyRoleColor', () => {
	it('emits a custom OKLCH palette’s shades, its 500 alias and the role’s named tokens', () => {
		skins.applyRoleColor('primary', 'shu')
		expect(css()).toMatchSnapshot()
	})

	it('converts a built-in palette’s values through the OKLCH adapter', () => {
		skins.applyRoleColor('accent', 'rose')
		expect(css()).toMatchSnapshot()
	})

	it('fills the dark block for a { light, dark } pair', () => {
		skins.applyRoleColor('surface', { light: 'stone', dark: 'zinc' })
		expect(css()).toMatchSnapshot()
	})

	it('keeps earlier roles when another is applied, and replaces a role re-applied', () => {
		skins.applyRoleColor('primary', 'shu')
		skins.applyRoleColor('surface', 'slate')
		skins.applyRoleColor('primary', 'teal')
		expect(css()).toMatchSnapshot()
		expect(document.querySelectorAll('#koan-skin-overrides')).toHaveLength(1)
	})

	it('falls back to the surface shade for on-primary when the primary fill cannot be resolved', () => {
		skins.applyRoleColor('surface', 'slate')
		skins.applyRoleColor('primary', 'no-such-palette')
		const out = css() ?? ''
		expect(out).toContain('--on-primary:var(--color-surface-50);')
		// No shades are declared for an unknown palette — only aliases that point at them.
		expect(out).not.toContain('--color-primary-500:')
		expect(out).toMatchSnapshot()
	})

	it('omits on-primary when neither the fill nor a surface override is available', () => {
		skins.applyRoleColor('primary', 'no-such-palette')
		expect(css()).not.toContain('--on-primary')
		expect(css()).toMatchSnapshot()
	})
})

describe('palette catalogue', () => {
	it('lists the skins and palettes as before', () => {
		expect(skins.skinDefinitions).toMatchSnapshot()
		expect(skins.availablePalettes).toMatchSnapshot()
	})

	it('gives the 500 swatch of a custom palette as oklch()', () => {
		expect(skins.getPaletteColor('shu')).toMatch(/^oklch\(/)
	})
})
