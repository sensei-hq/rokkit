import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * Every /app demo answers in the conversation pane (issue #224).
 *
 * Only some demos have a hand-written conversation (tabs, table, list, chart, …). The
 * rest — button, card, badge, switch and most of the catalog — used to leave the pane
 * blank under its header, whether reached from /app or opened directly. Each demo route
 * must show the user's ask and a reply about what is on the canvas.
 */
const routesDir = join(import.meta.dirname, '../src/routes/app')
const demoRoutes = readdirSync(routesDir, { withFileTypes: true })
	.filter((d) => d.isDirectory() && !d.name.includes('[') && d.name !== 'catalog')
	.filter((d) => existsSync(join(routesDir, d.name, '+page.svelte')))
	.map((d) => d.name)

test('the demo route list is discovered', () => {
	expect(demoRoutes).toEqual(expect.arrayContaining(['button', 'card', 'tabs', 'chart']))
})

for (const slug of demoRoutes) {
	test(`/app/${slug} answers in the conversation pane`, async ({ page }) => {
		await gotoHydrated(page, `/app/${slug}`)
		const pane = page.locator('.chat-left')
		await expect(pane.locator('[data-koanchat-message][data-kind="user"]').first()).toBeVisible()
		// A reply after the ask — `mounted` for most demos, `started` for the theme wizard.
		await expect(pane.locator('[data-koanchat-message][data-kind="info"]').first()).toBeVisible()
	})
}

test('a generic demo reply echoes the ask and names the component', async ({ page }) => {
	await gotoHydrated(page, '/app/button')
	const mounted = page.locator('.chat-left [data-message-status="mounted"]')
	await expect(mounted).toContainText('Button')
	await expect(page.locator('.chat-left [data-kind="user"]')).toContainText('Show me a Button')
})
