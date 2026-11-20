import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { PALETTE_FAMILIES } from '@rokkit/unocss/palettes'
import { loadConfig, resolveColormap } from '../../unocss/src/config.js'
import { themeFor, rootPreflights } from '../../unocss/src/colors.js'
import base from '../dist/base.css?raw'
import rokkit from '../dist/rokkit.css?raw'
import minimal from '../dist/minimal.css?raw'
import material from '../dist/material.css?raw'
import frosted from '../dist/frosted.css?raw'
import zenSumi from '../dist/zen-sumi.css?raw'

/**
 * The "No results" message in a filterable Select with no match reads at AA
 * (4.5:1) under every style, skin and mode.
 *
 * Base faded it to 60% opacity over ink-mute — 3.2–4.1:1 across the matrix (the
 * same defect as the trigger placeholder, #208). Unlike the trigger
 * placeholder it cannot render at rest (it needs a typed filter), so the
 * gallery gates can never see it — this spec is its pin.
 *
 * Measured, not inferred: each style's BUILT css (dist/) over the token vars
 * the preset emits for each skin, rendered in a real browser. Opacity must be
 * exactly 1 (the defect); the ratio is WCAG's over the composited ground. The
 * rokkit dropdown is a vertical mute→soft gradient, so the text's ground is an
 * interpolation — the spec asserts both stops clear 4.5 (the text lightness
 * sits strictly outside the stop range in both modes, asserted, so the minimum
 * over the gradient is at an endpoint).
 */
const STYLES = { rokkit, minimal, material, frosted, 'zen-sumi': zenSumi }

/** The built-in default skin, and every palette family as a consumer's default skin. */
const SKINS: Record<string, Record<string, unknown>> = {
	default: {},
	...Object.fromEntries(
		Object.entries(PALETTE_FAMILIES).map(([name, family]) => [
			name,
			{ palettes: family.palettes, colorSpace: 'oklch', skin: family.skin }
		])
	)
}

/** The consumer's reset (UnoCSS/Tailwind preflight): border-box, solid zero borders. */
const PREFLIGHT = '*,::before,::after{box-sizing:border-box;border:0 solid}'

/** The token vars `presetRokkit` installs for a config: `:root` light, `[data-mode="dark"]`. */
function tokenCss(userConfig: Record<string, unknown>) {
	const config = loadConfig(userConfig)
	const colormap = resolveColormap(config)
	return rootPreflights(themeFor(colormap, config, 'light'), colormap, config, [])
		.map((p: { getCSS: () => string }) => p.getCSS())
		.join('\n')
}

/** The modes a skin paints: dark only when the preset emits a dark block for it. */
const modesOf = (tokens: string) =>
	tokens.includes('[data-mode="dark"]') ? ['light', 'dark'] : ['light']

const CASES = Object.entries(SKINS).flatMap(([skin, config]) => {
	const tokens = tokenCss(config)
	return modesOf(tokens).map((mode) => ({ skin, mode, tokens }))
})

/** WCAG relative luminance of an 8-bit sRGB pixel. */
function luminance([r, g, b]: number[]) {
	const lin = (c: number) => {
		const s = c / 255
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio of two pixels. */
function contrast(a: number[], b: number[]) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (hi + 0.05) / (lo + 0.05)
}

let ctx: CanvasRenderingContext2D | null = null
/** Parse any CSS color to [r, g, b, a] via a 1px canvas. */
function toRGBA(c: string): [number, number, number, number] {
	if (!ctx) ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
	ctx!.clearRect(0, 0, 1, 1)
	ctx!.fillStyle = '#ff00ff'
	ctx!.fillStyle = c
	ctx!.fillRect(0, 0, 1, 1)
	const d = ctx!.getImageData(0, 0, 1, 1).data
	return [d[0], d[1], d[2], d[3] / 255]
}

const over = (fg: number[], bg: number[]) => {
	const a = fg[3]
	return [0, 1, 2].map((i) => Math.round(fg[i] * a + bg[i] * (1 - a)))
}

/** Composite the background from `el` up to (not including) documentElement. */
function effectiveBg(el: Element, pageBg: number[]) {
	let node: Element | null = el
	let solid: number[] | null = null
	const layers: number[][] = []
	while (node && node !== document.documentElement) {
		const cs = getComputedStyle(node)
		const bg = toRGBA(cs.backgroundColor)
		if (bg[3] > 0) {
			if (bg[3] >= 0.999) {
				solid = [bg[0], bg[1], bg[2]]
				break
			}
			layers.push(bg)
		}
		node = node.parentElement
	}
	let out = solid ?? pageBg
	for (let i = layers.length - 1; i >= 0; i--) out = over([...layers[i]], out)
	return out
}

const sheet = document.createElement('style')

beforeAll(() => {
	document.head.appendChild(sheet)
	const still = document.createElement('style')
	still.textContent = '*{transition:none!important}'
	document.head.appendChild(still)
})

afterEach(() => {
	document.body.replaceChildren()
})

/** A dropdown showing only the empty message, as a no-match filter leaves it. */
function mount() {
	const root = document.createElement('div')
	root.setAttribute('data-select', '')
	const dropdown = document.createElement('div')
	dropdown.setAttribute('data-select-dropdown', '')
	const empty = document.createElement('div')
	empty.setAttribute('data-select-empty', '')
	empty.textContent = 'No results'
	dropdown.append(empty)
	root.append(dropdown)
	document.body.replaceChildren(root)
	return { dropdown, empty }
}

const fmt = (n: number) => `${n.toFixed(2)}:1`

describe.each(Object.entries(STYLES))('%s select, no-match filter', (style, css) => {
	it.each(CASES)('$skin skin, $mode mode: empty message reads at 4.5', ({ mode, tokens }) => {
		document.body.dataset.style = style
		document.body.dataset.mode = mode
		sheet.textContent = `${PREFLIGHT}\n${tokens}\n${base}\n${css}`
		const { dropdown, empty } = mount()

		const cs = getComputedStyle(empty)
		expect(cs.opacity, 'empty message must not be faded').toBe('1')

		const pageBg = mode === 'dark' ? [17, 17, 17] : [255, 255, 255]
		const fg = toRGBA(cs.color)
		expect(fg[3], 'empty message color must be opaque').toBeGreaterThanOrEqual(0.999)

		const bgImage = getComputedStyle(dropdown).backgroundImage
		if (!bgImage || bgImage === 'none') {
			const ratio = contrast([fg[0], fg[1], fg[2]], effectiveBg(empty, pageBg))
			expect(ratio, `empty message contrast ${fmt(ratio)}`).toBeGreaterThanOrEqual(4.5)
			return
		}

		// Gradient ground (rokkit): parse both stops from the computed image and
		// require each to clear 4.5. The text lightness sits strictly outside the
		// stop range in both modes (asserted below), so the ratio over the
		// interpolation is worst at an endpoint.
		const stops = [...bgImage.matchAll(/(?:oklch|rgb)a?\([^)]+\)/g)].map((m) => toRGBA(m[0]))
		expect(stops.length, `parseable gradient stops in ${bgImage}`).toBeGreaterThanOrEqual(2)
		const textL = luminance([fg[0], fg[1], fg[2]])
		const stopLs = stops.map((s) => luminance([s[0], s[1], s[2]]))
		const outside =
			stopLs.every((l) => l < textL) || stopLs.every((l) => l > textL)
		expect(outside, 'text lightness outside the stop range').toBe(true)
		for (const stop of stops) {
			const ratio = contrast(
				[fg[0], fg[1], fg[2]],
				stop[3] >= 0.999 ? [stop[0], stop[1], stop[2]] : over(stop, effectiveBg(dropdown.parentElement!, pageBg))
			)
			expect(ratio, `empty message on gradient stop ${fmt(ratio)}`).toBeGreaterThanOrEqual(4.5)
		}
	})
})
