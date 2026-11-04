import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { page } from 'vitest/browser'
import { PALETTE_FAMILIES } from '../../unocss/src/palette-families.js'
import { loadConfig, resolveColormap } from '../../unocss/src/config.js'
import { themeFor, rootPreflights } from '../../unocss/src/colors.js'
import base from '../../themes/dist/base.css?raw'
import rokkit from '../../themes/dist/rokkit.css?raw'
import minimal from '../../themes/dist/minimal.css?raw'
import material from '../../themes/dist/material.css?raw'
import frosted from '../../themes/dist/frosted.css?raw'
import zenSumi from '../../themes/dist/zen-sumi.css?raw'
import ShellHarness from './fixtures/ShellHarness.svelte'

/**
 * The screen shell's info band is a WASH of its role over paper (the accent at 12% by day,
 * 18% by night) and its text stays ink, so it reads at WCAG AA (4.5:1) on that wash under every
 * style, skin and mode; its large mark (34px) and its meter are held to 3:1. A stat card's frame
 * — the same on every card, clickable or not — and the search field's frame identify a control,
 * so each stands 3:1 off the paper it sits on (WCAG 1.4.11).
 *
 * Measured, not inferred: the real ScreenShell, each style's BUILT css (themes/dist) over the
 * token vars `rootPreflights` emits for the default skin and every palette family, in each mode
 * the skin paints. Every colour is the browser's own computed value, composited on a canvas in
 * paint order (paper → band → text), so a translucent layer counts as the eye sees it.
 */
const STYLES = { 'zen-sumi': zenSumi, rokkit, minimal, material, frosted }

const SKINS: Record<string, Record<string, unknown>> = {
	default: {},
	...Object.fromEntries(
		Object.entries(PALETTE_FAMILIES).map(([name, family]) => [
			name,
			{ palettes: family.palettes, colorSpace: 'oklch', skin: family.skin }
		])
	)
}

const TEXT = 4.5
const NON_TEXT = 3

const PREFLIGHT = '*,::before,::after{box-sizing:border-box;border:0 solid}'

function tokenCss(userConfig: Record<string, unknown>) {
	const config = loadConfig(userConfig)
	const colormap = resolveColormap(config)
	return rootPreflights(themeFor(colormap, config, 'light'), colormap, config, [])
		.map((p: { getCSS: () => string }) => p.getCSS())
		.join('\n')
}

const modesOf = (tokens: string) =>
	tokens.includes('[data-mode="dark"]') ? ['light', 'dark'] : ['light']

const CASES = Object.entries(SKINS).flatMap(([skin, config]) => {
	const tokens = tokenCss(config)
	return modesOf(tokens).map((mode) => ({ skin, mode, tokens }))
})

function luminance([r, g, b]: number[]) {
	const lin = (c: number) => {
		const s = c / 255
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: number[], b: number[]) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (hi + 0.05) / (lo + 0.05)
}

const canvas = new OffscreenCanvas(1, 1)
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

/** The sRGB pixel of CSS colours painted one over the other, first at the bottom. */
function paint(...layers: string[]) {
	ctx.clearRect(0, 0, 1, 1)
	for (const layer of layers) {
		ctx.fillStyle = layer
		ctx.fillRect(0, 0, 1, 1)
	}
	return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3)
}

const sheet = document.createElement('style')

beforeAll(async () => {
	await page.viewport(1280, 900)
	document.head.appendChild(sheet)
	const still = document.createElement('style')
	still.textContent = '*{transition:none!important}'
	document.head.appendChild(still)
})

afterEach(() => {
	document.body.replaceChildren()
})

const fmt = (n: number) => `${n.toFixed(2)}:1`
const colorOf = (el: Element) => getComputedStyle(el).color
const fillOf = (el: Element) => getComputedStyle(el).backgroundColor
const edgeOf = (el: Element) => getComputedStyle(el).borderTopColor

/** Every ratio the spec holds, read from the rendered shell. */
function measure(root: HTMLElement) {
	const one = (sel: string) => root.querySelector(sel) as HTMLElement
	const all = (sel: string) => [...root.querySelectorAll(sel)] as HTMLElement[]
	const page = fillOf(one('[data-screen-shell]'))
	const wash = paint(page, fillOf(one('[data-screen-info]')))
	const washLayers = [page, fillOf(one('[data-screen-info]'))]
	const onWash = (el: HTMLElement) => contrast(paint(...washLayers, colorOf(el)), wash)
	const seal = one('[data-screen-info-step-seal]')
	const sealGround = [...washLayers, fillOf(seal)]

	const text: Array<[string, number]> = [
		...all('[data-screen-info-label]').map(
			(el, i) => [`eyebrow ${i + 1}`, onWash(el)] as [string, number]
		),
		['title', onWash(one('[data-screen-info-title]'))],
		...all('[data-screen-info-text]').map(
			(el, i) => [`lead ${i + 1}`, onWash(el)] as [string, number]
		),
		...all('[data-screen-info-step-title]').map(
			(el, i) => [`step title ${i + 1}`, onWash(el)] as [string, number]
		),
		...all('[data-screen-info-step-text]').map(
			(el, i) => [`step text ${i + 1}`, onWash(el)] as [string, number]
		),
		['value', onWash(one('[data-screen-info-value]'))],
		['total', onWash(one('[data-screen-info-total]'))],
		[
			'step mark on its seal',
			contrast(
				paint(...sealGround, colorOf(one('[data-screen-info-step-mark]'))),
				paint(...sealGround)
			)
		]
	]

	const statsGround = paint(page, fillOf(one('[data-screen-stats]')))
	const cards = all('[data-stat-card]')
	const nonText: Array<[string, number]> = [
		['large mark', onWash(one('[data-screen-info-mark]'))],
		[
			'meter fill on the wash',
			contrast(paint(...washLayers, fillOf(one('[data-screen-info-meter-fill]'))), wash)
		],
		...cards.flatMap((card) => {
			const name = card.querySelector('[data-stat-card-label]')?.textContent
			const frame = paint(page, fillOf(one('[data-screen-stats]')), edgeOf(card))
			const inside = paint(page, fillOf(one('[data-screen-stats]')), fillOf(card))
			return [
				[`frame of ${name} on the band`, contrast(frame, statsGround)],
				[`frame of ${name} on its card`, contrast(frame, inside)]
			] as Array<[string, number]>
		}),
		[
			'search frame',
			contrast(
				paint(page, fillOf(one('[data-screen-header]')), edgeOf(one('[data-screen-search]'))),
				paint(page, fillOf(one('[data-screen-header]')))
			)
		]
	]
	return { text, nonText }
}

describe.each(Object.entries(STYLES))('%s screen shell', (style, css) => {
	it.each(CASES)(
		'$skin skin, $mode mode: info text 4.5:1 on the wash, frames 3:1',
		async ({ mode, tokens }) => {
			document.body.dataset.style = style
			document.body.dataset.mode = mode
			sheet.textContent = `${PREFLIGHT}\n${tokens}\n${base}\n${css}`
			const { container } = render(ShellHarness, { height: 800, rows: 3, sideRows: 3 })
			const { text, nonText } = measure(container as HTMLElement)

			const problems = [
				...text.filter(([, r]) => r < TEXT).map(([n, r]) => `${n} ${fmt(r)}`),
				...nonText.filter(([, r]) => r < NON_TEXT).map(([n, r]) => `${n} ${fmt(r)}`)
			]
			expect(problems).toEqual([])
		}
	)
})
