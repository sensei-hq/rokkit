import { DEFAULT_THEME_MAPPING } from '@rokkit/core'

/**
 * Curated built-in skins (role → Tailwind palette). All palettes exist in
 * @rokkit/core defaultColors, so `data-skin` works with no extra config.
 *
 * `default` is bound to DEFAULT_THEME_MAPPING so the `[data-skin='default']`
 * block (when emitted) and the `:root` preflight resolve to the SAME named
 * tokens. The named skins reuse the same role vocabulary
 * (surface / ink / primary / accent) as DEFAULT_THEME_MAPPING.
 *
 * Consumer `skins` in rokkit.config.js merge on top and can override these.
 *
 * Each skin also carries per-mode `overrides` for its text roles — the same
 * treatment the palette families got (4fd0cfebf): Tailwind 500s read
 * 1.75–4.41:1 as light-mode text, so day steps deepen to the weakest shade
 * that clears 4.5:1 on paper and paper-soft, while night pins 500 (yesterday's
 * effective values — dark rendering is unchanged). Day steps were measured,
 * not picked: violet/indigo clear at 600 (5.20/5.74), everything else needs
 * 700, yellow needs 800 (700 lands at 4.49). loadConfig splits `overrides`
 * off (skins stay roles-only) and threads them into skinOverrides; a role the
 * consumer remaps keeps no built-in override (it names another palette).
 */
export const BUILTIN_SKINS = {
	default: {
		...DEFAULT_THEME_MAPPING,
		overrides: {
			primary: { light: 'orange.700', dark: 'orange.500' },
			accent: { light: 'sky.700', dark: 'sky.500' },
			success: { light: 'green.700', dark: 'green.500' },
			warning: { light: 'yellow.800', dark: 'yellow.500' },
			danger: { light: 'red.700', dark: 'red.500' },
			error: { light: 'red.700', dark: 'red.500' },
			info: { light: 'cyan.700', dark: 'cyan.500' }
		}
	},
	ocean: {
		surface: 'slate',
		ink: 'slate',
		primary: 'sky',
		accent: 'teal',
		overrides: {
			primary: { light: 'sky.700', dark: 'sky.500' },
			accent: { light: 'teal.700', dark: 'teal.500' }
		}
	},
	violet: {
		surface: 'zinc',
		ink: 'zinc',
		primary: 'violet',
		accent: 'indigo',
		overrides: {
			primary: { light: 'violet.600', dark: 'violet.500' },
			accent: { light: 'indigo.600', dark: 'indigo.500' }
		}
	},
	rose: {
		surface: 'stone',
		ink: 'stone',
		primary: 'rose',
		accent: 'orange',
		overrides: {
			primary: { light: 'rose.700', dark: 'rose.500' },
			accent: { light: 'orange.700', dark: 'orange.500' }
		}
	},
	emerald: {
		surface: 'slate',
		ink: 'slate',
		primary: 'emerald',
		accent: 'cyan',
		overrides: {
			primary: { light: 'emerald.700', dark: 'emerald.500' },
			accent: { light: 'cyan.700', dark: 'cyan.500' }
		}
	}
}
