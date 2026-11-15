/* The card variant: a framed list whose rows are split by a hairline (sensei's relay
 * lanes and completed lists, the dōjō's list sections). Display-only rows sit in it
 * as plain rows: no pointer, no hover. */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (p) => readFileSync(join(process.cwd(), 'packages/themes/src', p), 'utf-8')
const declarations = (p) => read(p).replace(/\/\*[\s\S]*?\*\//g, '')
const rulesFor = (file, selector) =>
	declarations(file)
		.split('}')
		.filter((rule) => rule.includes(selector))
const has = (file, selector, pattern) => rulesFor(file, selector).some((r) => pattern.test(r))

const STYLES = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']
const CARD = "[data-list][data-variant='card']"

describe('list theme CSS: the card variant', () => {
	it('base frames the card and clips its rows to it', () => {
		expect(has('base/list.css', CARD, /border-width:\s*1px/)).toBe(true)
		expect(has('base/list.css', CARD, /border-style:\s*solid/)).toBe(true)
		expect(has('base/list.css', CARD, /overflow:\s*hidden/)).toBe(true)
	})

	it('base splits the rows with a hairline and squares them', () => {
		const row = `${CARD} [data-list-item] + [data-list-item]`
		expect(has('base/list.css', row, /border-top-width:\s*1px/)).toBe(true)
		expect(has('base/list.css', row, /border-top-style:\s*solid/)).toBe(true)
		expect(has('base/list.css', `${CARD} [data-list-item]`, /border-radius:\s*0/)).toBe(true)
	})

	it('base gives a display-only row no pointer', () => {
		expect(has('base/list.css', '[data-list-item][data-static]', /cursor:\s*default/)).toBe(true)
	})

	it('base keeps colour out of the card', () => {
		const offenders = rulesFor('base/list.css', "[data-variant='card']").filter((r) =>
			/(^|[;{\s])(color|background-color|border-color|border-top-color):/.test(r)
		)
		expect(offenders).toEqual([])
	})

	for (const style of STYLES) {
		it(`${style} colours the card frame and the row hairline`, () => {
			const f = `${style}/list.css`
			expect(has(f, CARD, /border-color|@apply[^;]*border-/)).toBe(true)
			expect(has(f, `${CARD} [data-list-item] + [data-list-item]`, /border-top-color|@apply[^;]*border-/)).toBe(true)
		})

		it(`${style} leaves a display-only row unlit on hover`, () => {
			expect(has(`${style}/list.css`, '[data-static]', /background/)).toBe(true)
		})
	}
})
