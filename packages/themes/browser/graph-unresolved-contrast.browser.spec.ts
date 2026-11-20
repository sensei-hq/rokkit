import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { STYLES, CASES, applyConfig, assertTokensApplied, measureText, fmt, freezeMotion } from './contrast-lib.js'

/**
 * An unresolved design row (a real edge whose target is not placeable) dims
 * to signal "unplaced" — but its text still reads at AA (4.5:1) under every
 * style, skin and mode.
 *
 * The row faded to 60% opacity: ink text landed at 4.47:1 and the ink-mute
 * verb at 3.2:1 in light mode. The fix keeps the dim-as-signal (65%) and
 * moves the verb to ink under unresolved, so the dimmest text clears 4.5
 * with margin in every skin.
 */

const sheet = document.createElement('style')

beforeAll(() => {
	document.head.appendChild(sheet)
	freezeMotion()
})

afterEach(() => {
	document.body.replaceChildren()
})

/** A design row forced unresolved, with the DepList part hooks. */
function mount() {
	const list = document.createElement('div')
	list.setAttribute('data-graph-design-list', '')
	const row = document.createElement('div')
	row.setAttribute('data-graph-design-row', '')
	row.setAttribute('data-unresolved', '')
	const link = document.createElement('button')
	link.type = 'button'
	link.setAttribute('data-graph-design-link', '')
	link.textContent = 'customers'
	const badge = document.createElement('span')
	badge.setAttribute('data-graph-design-badge', '')
	badge.textContent = 'table'
	const verb = document.createElement('span')
	verb.setAttribute('data-graph-design-verb', '')
	verb.textContent = 'references'
	row.append(link, badge, verb)
	list.append(row)
	document.body.replaceChildren(list)
	return { link, badge, verb }
}

function checkText(el: Element, mode: string, what: string) {
	const m = measureText(el, mode)
	if (mode === 'dark' && m.ratio < 4.5)
		console.log('DBG', what, 'mode=', mode, 'dataset=', document.body.dataset.mode, 'fg=', JSON.stringify(m.fg), 'g=', JSON.stringify(m.grounds), 'ink=', getComputedStyle(document.body).getPropertyValue('--ink').trim().slice(0, 24))
	if (m.gradient) expect(m.outside, `${what}: text lightness outside the stop range`).toBe(true)
	expect(m.ratio, `${what} contrast ${fmt(m.ratio)}`).toBeGreaterThanOrEqual(4.5)
}

describe.each(Object.entries(STYLES))('%s graph, unresolved row', (style, css) => {
	it.each(CASES)('$skin skin, $mode mode: row text reads at 4.5', ({ mode, tokens }) => {
		applyConfig(sheet, { style, css, mode, tokens })
		assertTokensApplied(style)
		const { link, badge, verb } = mount()
		checkText(link, mode, 'unresolved link')
		checkText(badge, mode, 'unresolved badge')
		checkText(verb, mode, 'unresolved verb')
	})
})
