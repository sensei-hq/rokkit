import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { page } from 'vitest/browser'
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
 * An OFF switch is a control whose state is told by its shape alone, so WCAG 1.4.11 (non-text
 * contrast, 3:1) holds for it under every style, skin and mode:
 *
 * - the track's boundary — its border, or its fill when it has none — stands 3:1 off each
 *   surface a switch sits on: paper, paper-soft (a card) and paper-mute (a settings panel);
 * - the thumb stands 3:1 off the track it rides in.
 *
 * zen-sumi painted its off track `paper-edge`, which by night is the dark surface's 200 — the
 * very tone of paper-mute (1.00:1 against a settings card, thumb 1.19:1; sensei 2026-11-04).
 *
 * Measured, not inferred: each style's BUILT css (dist/) over the token vars the preset emits
 * for each skin (the same `rootPreflights` presetRokkit installs), rendered in a real browser
 * and read back as screenshot pixels, so translucent fills, gradients and borders count as the
 * eye sees them. Ratios are WCAG's, computed here from sRGB pixels.
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

const SURFACES = ['paper', 'paper-soft', 'paper-mute'] as const
const NON_TEXT = 3

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

const sheet = document.createElement('style')

beforeAll(async () => {
	// A viewport that fits the runner window, so the frame is not scaled and a screenshot pixel
	// is a CSS pixel (the default 414×896 frame is shrunk to fit, which blurs a 1px border).
	await page.viewport(400, 300)
	document.head.appendChild(sheet)
	const still = document.createElement('style')
	still.textContent = '*{transition:none!important}'
	document.head.appendChild(still)
})

afterEach(() => {
	document.body.replaceChildren()
})

/** One md switch, OFF, on a panel of each surface. */
function mount() {
	const row = document.createElement('div')
	row.style.cssText = 'position:fixed;left:0;top:0;display:flex'
	const panels = SURFACES.map((surface) => {
		const panel = document.createElement('div')
		panel.style.cssText = `background:var(--${surface});padding:12px;display:flex`
		const button = document.createElement('button')
		button.type = 'button'
		button.setAttribute('role', 'switch')
		button.setAttribute('data-switch', '')
		button.setAttribute('data-switch-size', 'md')
		button.setAttribute('aria-checked', 'false')
		const track = document.createElement('span')
		track.setAttribute('data-switch-track', '')
		const thumb = document.createElement('span')
		thumb.setAttribute('data-switch-thumb', '')
		track.append(thumb)
		button.append(track)
		panel.append(button)
		row.append(panel)
		return { surface, panel, track, thumb }
	})
	document.body.replaceChildren(row)
	return { row, panels }
}

/** The screenshot of `el` as a pixel reader in CSS px relative to the viewport. */
async function pixelsOf(el: HTMLElement) {
	const shot = await page.screenshot({ element: el, save: false })
	const blob = await (await fetch(`data:image/png;base64,${shot}`)).blob()
	const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' })
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
	const ctx = canvas.getContext('2d')!
	ctx.drawImage(bitmap, 0, 0)
	const box = el.getBoundingClientRect()
	const scale = bitmap.width / box.width
	return (x: number, y: number) =>
		Array.from(
			ctx.getImageData(Math.floor((x - box.left) * scale), Math.floor((y - box.top) * scale), 1, 1)
				.data
		).slice(0, 3)
}

/** Track boundary and thumb contrast, read from the pixels of each surface's switch. */
async function measure() {
	const { row, panels } = mount()
	const at = await pixelsOf(row)
	return panels.map(({ surface, panel, track, thumb }) => {
		const p = panel.getBoundingClientRect()
		const t = track.getBoundingClientRect()
		const h = thumb.getBoundingClientRect()
		const midY = t.top + t.height / 2
		const ground = at(p.left + 2, p.top + 2)
		const edge = at(t.left + t.width / 2, t.top + 0.5) // the straight top edge: border, else fill
		const fill = at(t.right - 8, midY) // inside the track, clear of an off thumb
		const knob = at(h.left + h.width / 2, h.top + h.height / 2)
		return {
			surface,
			track: Math.max(contrast(edge, ground), contrast(fill, ground)),
			thumb: contrast(knob, fill)
		}
	})
}

const fmt = (n: number) => `${n.toFixed(2)}:1`

describe.each(Object.entries(STYLES))('%s switch, off', (style, css) => {
	it.each(CASES)(
		'$skin skin, $mode mode: track and thumb read at 3:1',
		async ({ mode, tokens }) => {
			document.body.dataset.style = style
			document.body.dataset.mode = mode
			sheet.textContent = `${PREFLIGHT}\n${tokens}\n${base}\n${css}`
			const rows = await measure()
			const problems = rows.flatMap(({ surface, track, thumb }) => [
				...(track < NON_TEXT ? [`track on ${surface} ${fmt(track)}`] : []),
				...(thumb < NON_TEXT ? [`thumb on track (${surface}) ${fmt(thumb)}`] : [])
			])
			expect(problems).toEqual([])
		}
	)
})
