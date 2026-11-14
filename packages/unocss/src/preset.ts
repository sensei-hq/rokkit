import extractorSvelte from '@unocss/extractor-svelte'
import {
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'
import type { Preset } from 'unocss'
import { loadConfig, resolveColormap } from './config.js'
import { rootExtraVars } from './typography.js'
import { themeFor, rootPreflights, skinPreflights, themeColors } from './colors.js'
import { checkInkContrast } from './contrast.js'
import { iconCollectionsFor, safelist, shortcuts } from './shortcuts.js'

const THEME_CONFIG = {
	dark: {
		light: ':is([data-mode="light"],[data-mode="light"] *)',
		dark: ':is([data-mode="dark"],[data-mode="dark"] *)'
	}
}

// The font roles a config sets (typography.js): display · ui · mono. heading · sans · body are
// older spellings of the same roles. Rules, not theme.fontFamily: the wind preset's own
// sans/mono stacks would otherwise win and a utility would ignore the config.
const FONT_ROLES: Record<string, string> = {
	display: 'var(--font-display)',
	heading: 'var(--font-display)',
	ui: 'var(--font-ui)',
	sans: 'var(--font-ui)',
	body: 'var(--font-ui)',
	mono: 'var(--font-mono)'
}
const FONT_RULES: [string, Record<string, string>][] = Object.entries(FONT_ROLES).map(
	([role, variable]) => [`font-${role}`, { 'font-family': variable }]
)

// ─── Preset ──────────────────────────────────────────────────────────────────

export function presetRokkit(options = {}): Preset {
	const config = loadConfig(options)
	const colormap = resolveColormap(config)
	const theme = themeFor(colormap, config, 'light')
	checkInkContrast(config, colormap)

	return {
		name: 'rokkit',
		presets: [
			presetWind3(THEME_CONFIG),
			presetTypography(),
			presetIcons({
				extraProperties: { display: 'inline-block' },
				collections: iconCollectionsFor(config.icons)
			})
		],
		extractors: [extractorSvelte()],
		rules: [['hidden', { display: 'none' }], ...FONT_RULES],
		safelist: safelist(config),
		preflights: [
			...rootPreflights(theme, colormap, config, rootExtraVars(config)),
			...skinPreflights(config)
		],
		shortcuts: shortcuts(theme, colormap, config),
		theme: {
			fontFamily: Object.fromEntries(Object.entries(FONT_ROLES).map(([role, v]) => [role, [v]])),
			colors: themeColors(theme, colormap, config)
		},
		transformers: [transformerDirectives(), transformerVariantGroup()]
	}
}
