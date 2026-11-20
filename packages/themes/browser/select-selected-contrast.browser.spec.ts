import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { STYLES, CASES, applyConfig, measureText, fmt } from './contrast-lib.js'

/**
 * A selected option's label in an open Select/MultiSelect reads at AA (4.5:1)
 * under every style, skin and mode — focused AND unfocused-but-under-focus
 * (the state every keyboard user with two picks lands in).
 *
 * Two defects met here. zen-sumi's selected rule out-specified its focus rule,
 * leaving text-primary on the paper-mute interaction fill (4.4:1 dark, #209).
 * Frosted painted primary text on a 40% primary tint (2.6–2.7:1 both modes):
 * a translucent tint is not a solid fill, so the text takes ink. Rokkit's
 * gradient fill is axe-blind (INCOMPLETE) and the interaction gate only
 * measures focused subjects — the unfocused-selected pairing was invisible to
 * everything, so this spec pins both states explicitly with real focus.
 */

const sheet = document.createElement('style')

beforeAll(() => {
	document.head.appendChild(sheet)
	const still = document.createElement('style')
	still.textContent = '*{transition:none!important}'
	document.head.appendChild(still)
})

afterEach(() => {
	if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
	document.body.replaceChildren()
})

/** An open dropdown with two options, the first selected. */
function mount() {
	const root = document.createElement('div')
	root.setAttribute('data-select', '')
	const dropdown = document.createElement('div')
	dropdown.setAttribute('data-select-dropdown', '')
	const mkOption = (label: string, selected: boolean) => {
		const opt = document.createElement('button')
		opt.type = 'button'
		opt.setAttribute('data-select-option', '')
		if (selected) opt.setAttribute('data-selected', 'true')
		const text = document.createElement('span')
		text.setAttribute('data-item-text', '')
		const inner = document.createElement('span')
		inner.setAttribute('data-item-label', '')
		inner.textContent = label
		text.append(inner)
		opt.append(text)
		return opt
	}
	const selected = mkOption('Red', true)
	const other = mkOption('Blue', false)
	dropdown.append(selected, other)
	root.append(dropdown)
	document.body.replaceChildren(root)
	return { selected, other }
}

function selectedLabel() {
	return document.querySelector(
		'[data-select-option][data-selected="true"] [data-item-label]'
	) as HTMLElement
}

function checkSelected(mode: string, what: string) {
	const m = measureText(selectedLabel(), mode)
	expect(m.opacity, `${what} must not be faded`).toBe('1')
	expect(m.alpha, `${what} color must be opaque`).toBeGreaterThanOrEqual(0.999)
	if (m.gradient) expect(m.outside, `${what}: text lightness outside the stop range`).toBe(true)
	expect(m.ratio, `${what} contrast ${fmt(m.ratio)}`).toBeGreaterThanOrEqual(4.5)
}

describe.each(Object.entries(STYLES))('%s select, selected option', (style, css) => {
	it.each(CASES)('$skin skin, $mode mode: focused-selected reads at 4.5', ({ mode, tokens }) => {
		applyConfig(sheet, { style, css, mode, tokens })
		const { selected } = mount()
		selected.focus()
		expect(document.activeElement).toBe(selected)
		checkSelected(mode, 'focused-selected label')
	})

	it.each(CASES)(
		'$skin skin, $mode mode: unfocused-selected under focus-within reads at 4.5',
		({ mode, tokens }) => {
			applyConfig(sheet, { style, css, mode, tokens })
			const { selected, other } = mount()
			other.focus()
			expect(document.activeElement).toBe(other)
			expect(selected.matches(':focus')).toBe(false)
			checkSelected(mode, 'unfocused-selected label')
		}
	)
})
