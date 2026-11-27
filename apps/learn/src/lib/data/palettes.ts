/* Palettes a skin role can be pointed at: rokkit's own OKLCH palette families plus the
 * built-in (preset-mini) Tailwind palettes, and how to read their shades.
 */
import { defaultColors, shades } from '@rokkit/core'
import { PALETTE_FAMILIES } from '@rokkit/unocss/palettes'

/**
 * A skin role can map to a single palette name (same in light + dark) or
 * a dual-palette object `{ light, dark }` that swaps based on data-mode.
 */
export type RoleMapping = string | { light: string; dark: string }

// ── Custom OKLCH palettes: rokkit's palette families, as rokkit.config.js uses them ──

const customPalettes: Record<string, Record<number, string>> = Object.assign(
	{},
	...Object.values(PALETTE_FAMILIES).map((family) => family.palettes)
)

// ── Tailwind palette names available for individual role picking ─────────

const tailwindPaletteNames = [
	'slate', 'zinc', 'stone',
	'sky', 'teal', 'cyan',
	'violet', 'purple', 'indigo',
	'rose', 'pink', 'orange',
	'emerald', 'blue', 'amber', 'green', 'red',
]

const customPaletteNames = Object.keys(customPalettes)

/** All available palettes for individual role picking */
export const availablePalettes: string[] = [...customPaletteNames, ...tailwindPaletteNames]

// ── Palette value helpers ───────────────────────────────────────────────────

/**
 * A built-in palette by name, or null. preset-mini's colour map also holds keyword entries
 * (`inherit`, `current`…) that are plain strings, so an entry is only a palette if it is an
 * object — narrowed here rather than cast.
 */
function builtinPalette(name: string): Record<string | number, string> | null {
	const entry = (defaultColors as Record<string, unknown>)[name]
	return entry !== null && typeof entry === 'object' ? (entry as Record<string | number, string>) : null
}

export function isCustomPalette(name: string): boolean {
	return name in customPalettes
}

/**
 * Get the raw shade values for a palette (all shades).
 * Returns values as CSS-ready strings.
 */
export function getPaletteShades(paletteName: string): Record<number, string> | null {
	if (isCustomPalette(paletteName)) {
		return customPalettes[paletteName]
	}
	const tw = builtinPalette(paletteName)
	if (!tw) return null
	const result: Record<number, string> = {}
	for (const shade of shades) {
		if (tw[shade] !== undefined) {
			result[shade] = tw[shade]
		}
	}
	return result
}

/**
 * Get the 500-shade color for a palette — used for swatch display.
 * Returns a CSS-ready color string.
 */
export function getPaletteColor(paletteName: string): string {
	if (isCustomPalette(paletteName)) {
		return `oklch(${customPalettes[paletteName][500]})`
	}
	return builtinPalette(paletteName)?.[500] ?? '#888'
}
