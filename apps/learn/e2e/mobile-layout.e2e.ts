import { test, expect, type Page } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * Phone-width layout. At 390px nothing may run off the side of the screen: an element
 * that extends past the viewport is a defect unless a user-scrollable ancestor (a code
 * block, a wide table) holds it — `overflow: hidden` ancestors do not count, because
 * clipped content is content the visitor cannot reach.
 *
 * One representative route per layout shell: landing, guides, the components catalogue,
 * the /app chat + canvas shell (landing and a mounted demo), and /chat's mode picker.
 */
const PHONE = { width: 390, height: 844 }

test.use({ viewport: PHONE, isMobile: true, hasTouch: true })

/** Elements that escape the viewport horizontally and that no scroll container reaches. */
function escapees(page: Page) {
	return page.evaluate((vw) => {
		const found: { el: Element; id: string; left: number; right: number }[] = []
		for (const el of document.querySelectorAll('body *')) {
			const box = el.getBoundingClientRect()
			if (box.width === 0 || box.height === 0) continue
			if (box.right <= vw + 1 && box.left >= -1) continue
			if (getComputedStyle(el).visibility === 'hidden') continue
			if (found.some((f) => f.el.contains(el))) continue
			let reachable = false
			for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
				if (!/(auto|scroll)/.test(getComputedStyle(p).overflowX)) continue
				const pb = p.getBoundingClientRect()
				if (pb.right <= vw + 1 && pb.left >= -1) {
					reachable = true
					break
				}
			}
			if (reachable) continue
			const attrs = [...el.attributes]
				.filter((a) => a.name.startsWith('data-') || a.name === 'class')
				.map((a) => `[${a.name}=${a.value.slice(0, 40)}]`)
				.join('')
			found.push({ el, id: el.tagName.toLowerCase() + attrs, left: Math.round(box.left), right: Math.round(box.right) })
		}
		return found.map(({ id, left, right }) => `${id} ${left}..${right}`)
	}, PHONE.width)
}

const routes = [
	'/',
	'/guides',
	'/guides/getting-started',
	'/components',
	'/components/button',
	'/app',
	'/app/button',
	'/app/catalog',
	'/chat'
]

for (const path of routes) {
	test(`${path} fits a 390px phone screen`, async ({ page }) => {
		await gotoHydrated(page, path)
		await page.waitForLoadState('networkidle')
		expect(await escapees(page)).toEqual([])
	})
}

test('the guide reading pane gets the full phone width', async ({ page }) => {
	await gotoHydrated(page, '/guides/getting-started')
	const main = await page.locator('#guides-main').boundingBox()
	expect(main?.width).toBeGreaterThanOrEqual(PHONE.width - 2)
})

test('the guides rail opens from a toggle on a phone and closes on navigation', async ({ page }) => {
	await gotoHydrated(page, '/guides/getting-started')
	const rail = page.locator('.rail')
	await expect(rail).toBeHidden()
	await page.getByRole('button', { name: 'Browse guides' }).click()
	await expect(rail).toBeVisible()
	await rail.locator('a[data-list-item]:not([data-active])').first().click()
	await expect(page).not.toHaveURL(/getting-started$/)
	await expect(rail).toBeHidden()
})

test('the /app canvas is not squeezed by the history rail on a phone', async ({ page }) => {
	await gotoHydrated(page, '/app/button')
	const canvas = await page.locator('main.canvas').boundingBox()
	// Collapsed history rail is 48px; everything else belongs to the content.
	expect(canvas?.width).toBeGreaterThanOrEqual(PHONE.width - 50)
})

test('expanding the /app history on a phone overlays it instead of squeezing content', async ({ page }) => {
	await gotoHydrated(page, '/app/button')
	await page.getByRole('button', { name: 'Expand sidebar' }).click()
	const history = page.locator('[data-koanchat-history]')
	const box = await history.boundingBox()
	expect((box?.x ?? 0) + (box?.width ?? Infinity)).toBeLessThanOrEqual(PHONE.width)
	const canvas = await page.locator('main.canvas').boundingBox()
	expect(canvas?.width).toBeGreaterThanOrEqual(PHONE.width - 50)
})

test('every site nav link is reachable on a phone', async ({ page }) => {
	await gotoHydrated(page, '/')
	for (const name of ['Explore', 'Guides', 'Ask Rokkit']) {
		const link = page.locator('[data-site-nav] a', { hasText: name })
		await expect(link).toBeInViewport({ ratio: 1 })
	}
})
