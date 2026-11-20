import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { STYLES, CASES, applyConfig, measureText, fmt } from './contrast-lib.js'

/**
 * The "No results" message in a filterable Select with no match reads at AA
 * (4.5:1) under every style, skin and mode.
 *
 * Base faded it to 60% opacity over ink-mute — 3.2–4.1:1 across the matrix (the
 * same defect as the trigger placeholder, #208). Unlike the trigger
 * placeholder it cannot render at rest (it needs a typed filter), so the
 * gallery gates can never see it — this spec is its pin.
 */

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

describe.each(Object.entries(STYLES))('%s select, no-match filter', (style, css) => {
	it.each(CASES)('$skin skin, $mode mode: empty message reads at 4.5', ({ mode, tokens }) => {
		applyConfig(sheet, { style, css, mode, tokens })
		const { empty } = mount()
		const m = measureText(empty, mode)
		expect(m.opacity, 'empty message must not be faded').toBe('1')
		expect(m.alpha, 'empty message color must be opaque').toBeGreaterThanOrEqual(0.999)
		if (m.gradient)
			expect(m.outside, 'text lightness outside the stop range').toBe(true)
		expect(m.ratio, `empty message contrast ${fmt(m.ratio)}`).toBeGreaterThanOrEqual(4.5)
	})
})
