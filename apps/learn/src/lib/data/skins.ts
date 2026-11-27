/**
 * Skin definitions and runtime color-role switching for the Sensei demo app.
 *
 * Provides predefined skins (from rokkit.config.js), a list of available palettes,
 * and helpers to apply skin or individual role overrides at runtime by setting
 * CSS custom properties on the document root.
 */

import { PALETTE_FAMILIES } from '@rokkit/unocss/palettes'
import type { RoleMapping } from './palettes'

export { availablePalettes, getPaletteColor } from './palettes'
export { applyRoleColor } from './skin-style'

// ── Skin definitions ────────────────────────────────────────────────────────

interface SkinDefinition {
	name: string
	label: string
	surface: string
	darkSurface?: string
	ink: string
	primary: string
	secondary: string
	accent: string
}

/** A role's palette on light paper — the one a swatch shows. */
const lightSide = (mapping: RoleMapping) => (typeof mapping === 'string' ? mapping : mapping.light)
/** `sea-glass` → `Sea Glass`. */
const titleOf = (name: string) => name.replace(/(^|-)(\w)/g, (_, sep, c) => `${sep ? ' ' : ''}${c.toUpperCase()}`)

/**
 * The palette families as switchable skins, in rokkit.config.js's order. zen-sumi is the
 * `default` skin (its tokens are the `:root` ones); the rest keep their family names.
 */
export const skinDefinitions: SkinDefinition[] = Object.values(PALETTE_FAMILIES).map(({ name, skin }) => {
	const surface = skin.surface as RoleMapping
	return {
		name: name === 'zen-sumi' ? 'default' : name,
		label: titleOf(name),
		surface: lightSide(surface),
		darkSurface: typeof surface === 'string' ? undefined : surface.dark,
		ink: lightSide(skin.ink as RoleMapping),
		primary: lightSide(skin.primary as RoleMapping),
		secondary: lightSide(skin.secondary as RoleMapping),
		accent: lightSide(skin.accent as RoleMapping)
	}
})
