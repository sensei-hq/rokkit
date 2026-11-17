import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { page } from 'vitest/browser'
import { loadConfig, resolveColormap } from '../../unocss/src/config.js'
import { themeFor, rootPreflights } from '../../unocss/src/colors.js'
import base from '../dist/base.css?raw'
import rokkit from '../dist/rokkit.css?raw'

/**
 * The `rokkit` style's OFF switch track has a fill: `paper-mute` reads as an opaque
 * background, not the surface showing through. Its `from-paper-mute to-paper-mute`
 * gradient compiled to no stops at all (paper/ink tones resolve no `--color-*` var, the
 * only thing gradient stops read), so the track was transparent and only its border
 * held the 3:1 boundary.
 *
 * Measured, like the contrast spec: the style's BUILT css over the token vars the preset
 * emits for the default skin, in a real browser.
 */

/** The consumer's reset (UnoCSS/Tailwind preflight): border-box, solid zero borders. */
const PREFLIGHT = '*,::before,::after{box-sizing:border-box;border:0 solid}'

/** The token vars `presetRokkit` installs for the default skin. */
function tokenCss() {
	const config = loadConfig({})
	const colormap = resolveColormap(config)
	return rootPreflights(themeFor(colormap, config, 'light'), colormap, config, [])
		.map((p: { getCSS: () => string }) => p.getCSS())
		.join('\n')
}

const TOKENS = tokenCss()
const MODES = TOKENS.includes('[data-mode="dark"]') ? ['light', 'dark'] : ['light']

const sheet = document.createElement('style')

beforeAll(async () => {
	await page.viewport(400, 300)
	document.head.appendChild(sheet)
	const still = document.createElement('style')
	still.textContent = '*{transition:none!important}'
	document.head.appendChild(still)
})

afterEach(() => {
	document.body.replaceChildren()
})

/** One md switch, OFF, on a paper panel. */
function mount() {
	const panel = document.createElement('div')
	panel.style.cssText = 'position:fixed;left:0;top:0;background:var(--paper);padding:12px'
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
	document.body.replaceChildren(panel)
	return { panel, track }
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

const alphaOf = (color: string) => {
	const m = color.match(/rgba?\(([^)]+)\)/)
	const parts = m![1].split(',').map((p) => p.trim())
	return parts.length === 4 ? Number(parts[3]) : 1
}

describe('rokkit switch, off', () => {
	it.each(MODES)('%s mode: the track has a non-transparent fill', async (mode) => {
		document.body.dataset.style = 'rokkit'
		document.body.dataset.mode = mode
		sheet.textContent = `${PREFLIGHT}\n${TOKENS}\n${base}\n${rokkit}`
		const { panel, track } = mount()

		expect(alphaOf(getComputedStyle(track).backgroundColor)).toBe(1)

		const at = await pixelsOf(panel)
		const p = panel.getBoundingClientRect()
		const t = track.getBoundingClientRect()
		const ground = at(p.left + 2, p.top + 2)
		const fill = at(t.right - 8, t.top + t.height / 2)
		expect(fill).not.toEqual(ground)
	})
})
