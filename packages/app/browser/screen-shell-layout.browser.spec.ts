import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { page } from 'vitest/browser'
import { PALETTE_FAMILIES } from '../../unocss/src/palette-families.js'
import { loadConfig, resolveColormap } from '../../unocss/src/config.js'
import { themeFor, rootPreflights } from '../../unocss/src/colors.js'
import base from '../../themes/dist/base.css?raw'
import zenSumi from '../../themes/dist/zen-sumi.css?raw'
import ShellHarness from './fixtures/ShellHarness.svelte'

/**
 * The shell fills its container and only the body and the sidebar scroll, each on its own:
 * with a body and a sidebar far taller than the frame, the title bar, the bands and the footer
 * stay exactly where they were while either region scrolls, and neither the frame, the shell nor
 * the page scrolls at all. Real layout (jsdom reports every box as 0×0), over the built css.
 */
const PREFLIGHT = '*,::before,::after{box-sizing:border-box;border:0 solid}'

function tokenCss() {
	const family = PALETTE_FAMILIES['zen-sumi']
	const config = loadConfig({ palettes: family.palettes, colorSpace: 'oklch', skin: family.skin })
	const colormap = resolveColormap(config)
	return rootPreflights(themeFor(colormap, config, 'light'), colormap, config, [])
		.map((p: { getCSS: () => string }) => p.getCSS())
		.join('\n')
}

const FRAME = 640
const sheet = document.createElement('style')

beforeAll(async () => {
	await page.viewport(1280, 900)
	sheet.textContent = `${PREFLIGHT}\n${tokenCss()}\nbody{margin:0}\n${base}\n${zenSumi}`
	document.head.appendChild(sheet)
	document.body.dataset.style = 'zen-sumi'
	document.body.dataset.mode = 'light'
})

afterEach(() => {
	document.body.replaceChildren()
})

const FIXED = [
	'[data-screen-titlebar]',
	'[data-screen-description]',
	'[data-screen-info]',
	'[data-screen-stats]',
	'[data-screen-filters]',
	'[data-screen-footer]'
]

function setup() {
	const { container } = render(ShellHarness, { height: FRAME, rows: 200, sideRows: 200 })
	const one = (sel: string) => container.querySelector(sel) as HTMLElement
	return {
		frame: one('[data-test-frame]'),
		shell: one('[data-screen-shell]'),
		header: one('[data-screen-header]'),
		body: one('[data-screen-body]'),
		sidebar: one('[data-screen-sidebar]'),
		one
	}
}

const tops = (one: (s: string) => HTMLElement) =>
	FIXED.map((sel) => [sel, Math.round(one(sel).getBoundingClientRect().top)])

describe('ScreenShell layout', () => {
	it('fills its container: the shell is the frame’s height, the footer at its bottom', () => {
		const { frame, shell, one } = setup()
		const frameBox = frame.getBoundingClientRect()

		expect(Math.round(shell.getBoundingClientRect().height)).toBe(FRAME)
		expect(Math.round(one('[data-screen-footer]').getBoundingClientRect().bottom)).toBe(
			Math.round(frameBox.bottom)
		)
	})

	it('lets the body and the sidebar overflow, each in its own scroll region', () => {
		const { body, sidebar } = setup()

		expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
		expect(sidebar.scrollHeight).toBeGreaterThan(sidebar.clientHeight)
		expect(getComputedStyle(body).overflowY).toBe('auto')
		expect(getComputedStyle(sidebar).overflowY).toBe('auto')
	})

	it('keeps the header, the bands and the footer still while the body scrolls', () => {
		const { body, sidebar, frame, shell, one } = setup()
		const before = tops(one)

		body.scrollTop = 900
		expect(body.scrollTop).toBeGreaterThan(0)
		expect(tops(one)).toEqual(before)
		expect(sidebar.scrollTop).toBe(0)
		expect([frame.scrollTop, shell.scrollTop, document.scrollingElement!.scrollTop]).toEqual([
			0, 0, 0
		])
	})

	it('keeps them still while the sidebar scrolls, and the body where it was', () => {
		const { body, sidebar, one } = setup()
		const before = tops(one)

		sidebar.scrollTop = 900
		expect(sidebar.scrollTop).toBeGreaterThan(0)
		expect(tops(one)).toEqual(before)
		expect(body.scrollTop).toBe(0)
	})

	it('scrolls nothing else: no other part of the shell overflows', () => {
		const { shell, body, sidebar } = setup()
		const scrolling = [shell, ...shell.querySelectorAll<HTMLElement>('*')].filter((el) => {
			if (el === body || el === sidebar || body.contains(el) || sidebar.contains(el)) return false
			const { overflowY } = getComputedStyle(el)
			return (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight
		})

		expect(scrolling.map((el) => el.outerHTML.slice(0, 60))).toEqual([])
		expect(shell.scrollHeight).toBe(shell.clientHeight)
	})
})
