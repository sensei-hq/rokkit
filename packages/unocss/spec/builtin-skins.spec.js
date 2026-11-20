import { describe, it, expect } from 'vitest'
import { relativeLuminance, pickOnColor, defaultColors, ColorSpace } from '@rokkit/core'
import { BUILTIN_SKINS } from '../src/builtin-skins.js'
import { loadConfig } from '../src/config.js'
import { tokenValue } from '../src/contrast.js'
import { presetRokkit } from '../src/preset.js'

/**
 * Every built-in skin is a ready skin: its text roles read at AA on paper and
 * paper-soft, and its fills take readable on-colours — the same contract the
 * palette families keep (4fd0cfebf), which the built-ins never got: bare
 * `presetRokkit({})` painted primary/accent/status text at 500 in light mode
 * (1.75–3.44:1 on paper).
 *
 * Like the families, built-ins take deeper day shades and keep 500 by night —
 * so the dark block pins exactly yesterday's effective values (dark rendering
 * is unchanged; only light text deepens). Bare configs have no dark mode
 * (no dual palettes, no flip — a dark block appears only to pin the 500s), so
 * night contrast is out of scope here; the night assertions pin values, not
 * ratios. Named built-in skins map no status roles (pre-existing gap), so
 * status is asserted for `default` only.
 */
const AA = 4.5
// Text roles each built-in skin maps.
const TEXT_ROLES = {
	default: ['primary', 'accent', 'success', 'warning', 'danger', 'error', 'info'],
	ocean: ['primary', 'accent'],
	violet: ['primary', 'accent'],
	rose: ['primary', 'accent'],
	emerald: ['primary', 'accent']
}
const Y = (v) => relativeLuminance(v)
const ratio = (a, b) => (Math.max(Y(a), Y(b)) + 0.05) / (Math.min(Y(a), Y(b)) + 0.05)
const rgb = ColorSpace.create('rgb')
const wrap = (v) => rgb.wrap(v)

describe.each(Object.entries(BUILTIN_SKINS))('built-in skin %s', (name, skin) => {
	const config = loadConfig({})
	const value = (token, mode) => tokenValue(config, skin, token, mode)

	it('reads its text roles at AA on paper and paper-soft by day', () => {
		const problems = TEXT_ROLES[name].flatMap((role) =>
			['paper', 'paper-soft']
				.filter((bg) => ratio(value(role, 'light'), value(bg, 'light')) < AA)
				.map((bg) => `${role} on ${bg}: ${ratio(value(role, 'light'), value(bg, 'light')).toFixed(2)}`)
		)
		expect(problems).toEqual([])
	})

	it('puts a readable on-colour on each fill it paints by day', () => {
		const problems = TEXT_ROLES[name]
			.map((role) => [role, value(role, 'light')])
			.filter(([, fill]) => fill !== undefined)
			.map(([role, fill]) => [role, ratio(fill, pickOnColor(Y(fill)))])
			.filter(([, r]) => r < AA)
			.map(([role, r]) => `${role}: ${r.toFixed(2)}`)
		expect(problems).toEqual([])
	})
})

describe('built-in skin overrides (loadConfig)', () => {
	it('are not a role: skins entries stay roles-only', () => {
		const config = loadConfig({})
		for (const [name, mapping] of Object.entries(config.skins)) {
			expect(mapping, name).not.toHaveProperty('overrides')
		}
		expect(config.skin).not.toHaveProperty('overrides')
	})

	it('give the bare :root block day steps with night pinned at 500', () => {
		const css = presetRokkit({}).preflights.map((p) => p.getCSS()).join('\n')
		const [light, dark] = css.split('[data-mode="dark"]')
		expect(dark, 'bare preset emits a dark block').toBeDefined()
		// orange-700 by day (4.73:1), orange-500 by night (yesterday's value, unchanged).
		expect(light).toContain(`--primary:${wrap(defaultColors.orange['700'])}`)
		expect(dark).toContain(`--primary:${wrap(defaultColors.orange['500'])}`)
	})

	it('keep other roles steps when one role is remapped (no cross-palette leak)', () => {
		const config = loadConfig({ skin: { primary: 'blue' } })
		const css = presetRokkit({ skin: { primary: 'blue' } })
			.preflights.map((p) => p.getCSS())
			.join('\n')
		const [light] = css.split('[data-mode="dark"]')
		// blue primary resolves at 500 (no built-in override applies to a remapped role)…
		expect(light).toContain(`--primary:${wrap(defaultColors.blue['500'])}`)
		// …while untouched roles keep their built-in day steps.
		expect(light).toContain(`--accent:${wrap(defaultColors.sky['700'])}`)
		expect(config.skinOverrides.skin).not.toHaveProperty('primary')
		expect(config.skinOverrides.skin).toHaveProperty('accent')
	})

	it('yield a named skin entirely to the user skin of the same name', () => {
		const config = loadConfig({ skins: { ocean: { primary: 'cyan', surface: 'slate' } } })
		expect(config.skins.ocean).toEqual({ primary: 'cyan', surface: 'slate' })
		expect(config.skinOverrides.ocean ?? {}).not.toHaveProperty('primary')
	})
})
