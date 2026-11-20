import { PALETTE_FAMILIES, zenSumi as zenSumiFamily } from '@rokkit/unocss/palettes'
import { loadConfig, resolveColormap } from '../../unocss/src/config.js'
import { themeFor, rootPreflights } from '../../unocss/src/colors.js'
import base from '../dist/base.css?raw'
import rokkit from '../dist/rokkit.css?raw'
import minimal from '../dist/minimal.css?raw'
import material from '../dist/material.css?raw'
import frosted from '../dist/frosted.css?raw'
import zenSumi from '../dist/zen-sumi.css?raw'

/**
 * Shared harness for text-contrast browser specs: each style's BUILT css
 * (dist/) over the token vars the preset emits for each skin, rendered in a
 * real browser and read back as computed styles.
 */

export const STYLES = { rokkit, minimal, material, frosted, 'zen-sumi': zenSumi }

/**
 * The skins under test, aligned with the app's own config (apps/learn
 * rokkit.config.js): `default` IS the zen-sumi family, not the preset's bare
 * slate/orange defaults. (Bare `loadConfig({})` is a different universe whose
 * orange-500-as-text fails AA on its own — a separate preset-level concern,
 * not this harness's.)
 */
export const SKINS: Record<string, Record<string, unknown>> = {
	default: {
		palettes: zenSumiFamily.palettes,
		colorSpace: 'oklch',
		skin: zenSumiFamily.skin
	},
	...Object.fromEntries(
		Object.entries(PALETTE_FAMILIES)
			.filter(([name]) => name !== 'zen-sumi')
			.map(([name, family]) => [
				name,
				{ palettes: family.palettes, colorSpace: 'oklch', skin: family.skin }
			])
	)
}

/** The consumer's reset (UnoCSS/Tailwind preflight): border-box, solid zero borders. */
export const PREFLIGHT = '*,::before,::after{box-sizing:border-box;border:0 solid}'

/** The token vars `presetRokkit` installs for a config: `:root` light, `[data-mode="dark"]`. */
export function tokenCss(userConfig: Record<string, unknown>) {
	const config = loadConfig(userConfig)
	const colormap = resolveColormap(config)
	return rootPreflights(themeFor(colormap, config, 'light'), colormap, config, [])
		.map((p: { getCSS: () => string }) => p.getCSS())
		.join('\n')
}

/** The modes a skin paints: dark only when the preset emits a dark block for it. */
export const modesOf = (tokens: string) =>
	tokens.includes('[data-mode="dark"]') ? ['light', 'dark'] : ['light']

export const CASES = Object.entries(SKINS).flatMap(([skin, config]) => {
	const tokens = tokenCss(config)
	return modesOf(tokens).map((mode) => ({ skin, mode, tokens }))
})

/** WCAG relative luminance of an 8-bit sRGB pixel. */
export function luminance([r, g, b]: number[]) {
	const lin = (c: number) => {
		const s = c / 255
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio of two pixels. */
export function contrast(a: number[], b: number[]) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (hi + 0.05) / (lo + 0.05)
}

export const fmt = (n: number) => `${n.toFixed(2)}:1`

let ctx: CanvasRenderingContext2D | null = null
/** Parse any CSS color to [r, g, b, a] via a 1px canvas. */
export function toRGBA(c: string): [number, number, number, number] {
	if (!ctx) ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
	ctx!.clearRect(0, 0, 1, 1)
	ctx!.fillStyle = '#ff00ff'
	ctx!.fillStyle = c
	ctx!.fillRect(0, 0, 1, 1)
	const d = ctx!.getImageData(0, 0, 1, 1).data
	return [d[0], d[1], d[2], d[3] / 255]
}

export const over = (fg: number[], bg: number[]) => {
	const a = fg[3]
	return [0, 1, 2].map((i) => Math.round(fg[i] * a + bg[i] * (1 - a)))
}

/** Composite the background from `el` up to (not including) documentElement. */
export function effectiveBg(el: Element, pageBg: number[]) {
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

/**
 * The opaque grounds behind `textEl`'s text: one for a flat/translucent stack,
 * one per gradient stop when the lowest painted ancestor uses a gradient (each
 * stop composited over everything beneath the gradient element).
 */
export function textGrounds(
	textEl: Element,
	pageBg: number[]
): { grounds: number[][]; gradient: boolean } {
	const stack: { bg: number[]; image: string }[] = []
	let node: Element | null = textEl
	while (node && node !== document.documentElement) {
		const cs = getComputedStyle(node)
		stack.push({ bg: toRGBA(cs.backgroundColor), image: cs.backgroundImage })
		node = node.parentElement
	}
	const composite = (from: number, to: number, seed: number[]) => {
		let out = seed
		for (let i = from; i >= to; i--) {
			const bg = stack[i].bg
			if (bg[3] > 0) out = bg[3] >= 0.999 ? [bg[0], bg[1], bg[2]] : over(bg, out)
		}
		return out
	}
	const gi = stack.findIndex((s) => s.image && s.image !== 'none')
	if (gi < 0) return { grounds: [composite(stack.length - 1, 0, pageBg)], gradient: false }
	const gradient = stack[gi].image
	const stops = [...gradient.matchAll(/(?:oklch|rgb)a?\([^)]+\)|color\([^)]+\)/g)].map((m) =>
		toRGBA(m[0])
	)
	if (!stops.length) throw new Error(`unparseable gradient ground: ${gradient}`)
	// Beneath a stop: the gradient element's own background-color, over everything above it.
	const under = composite(stack.length - 1, gi, pageBg)
	const grounds = stops.map((s) =>
		composite(gi - 1, 0, s[3] >= 0.999 ? [s[0], s[1], s[2]] : over(s, under))
	)
	return { grounds, gradient: true }
}

/** The element's own opacity — a faded element's contrast is its blended ratio. */
export const ownOpacity = (el: Element) => parseFloat(getComputedStyle(el).opacity)

import baseCss from '../dist/base.css?raw'

/**
 * Apply a style config to the page: dataset attributes plus a full sheet
 * (preflight + skin tokens + base + style css).
 */
export function applyConfig(
	sheet: HTMLStyleElement,
	style: string,
	css: string,
	mode: string,
	tokens: string
) {
	document.body.dataset.style = style
	document.body.dataset.mode = mode
	sheet.textContent = `${PREFLIGHT}\n${tokens}\n${baseCss}\n${css}`
}

/**
 * Measure flat text: its opacity, opaque color, and WCAG ratio over every
 * ground behind it (one, or one per gradient stop). For gradients also reports
 * whether the text lightness sits strictly outside the stop range — when it
 * does, the minimum over the interpolation is at an endpoint.
 */
export function measureText(el: Element, mode: string) {
	const cs = getComputedStyle(el)
	const fg = toRGBA(cs.color)
	const pageBg = mode === 'dark' ? [17, 17, 17] : [255, 255, 255]
	const { grounds, gradient } = textGrounds(el, pageBg)
	const flat = [fg[0], fg[1], fg[2]]
	const ratios = grounds.map((g) => contrast(flat, g))
	const textL = luminance(flat)
	const stopLs = grounds.map((g) => luminance(g))
	const outside = stopLs.every((l) => l < textL) || stopLs.every((l) => l > textL)
	return {
		opacity: cs.opacity,
		alpha: fg[3],
		fg: flat,
		grounds,
		gradient,
		ratios,
		outside,
		ratio: Math.min(...ratios)
	}
}
