import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every published package names the repository it is built from.
 *
 * Publishing runs with `--provenance` through npm trusted publishing, and npm refuses a
 * provenance whose `repository.url` differs from the repository that ran the workflow — so
 * when the repository moved to sensei-hq, a manifest still naming the old owner would fail
 * the next release.
 *
 * Vitest runs from the repo root; resolve against cwd (see workspace-peers.spec.js).
 */

const PACKAGES_DIR = join(process.cwd(), 'packages')
const REPOSITORY = /^git\+https:\/\/github\.com\/sensei-hq\/rokkit\.git$/

const packages = readdirSync(PACKAGES_DIR)
	.map((dir) => join(PACKAGES_DIR, dir, 'package.json'))
	.filter((file) => existsSync(file))
	.map((file) => JSON.parse(readFileSync(file, 'utf8')))
	.filter((pkg) => !pkg.private)

describe('published package repository', () => {
	it('finds the publishable packages to check', () => {
		expect(packages.length).toBeGreaterThan(8)
	})

	it.each(packages.map((pkg) => [pkg.name, pkg]))(
		'%s names github.com/sensei-hq/rokkit',
		(_, pkg) => {
			expect(pkg.repository?.url).toMatch(REPOSITORY)
		}
	)
})
