/* Characterization: every demo's metadata, as the catalogue exports it.
 *
 * The meta files are content — API tables, source snippets, tool specs — and moving that
 * content around (into data files, shared builders) must not change a single value the site
 * renders. The snapshot is the value as it stood before any such move; a mismatch is a
 * content change, so either it was meant (update the snapshot in the same commit) or it is
 * a regression.
 *
 * `load` / `preview` are dynamic imports (compared by presence, not identity), and `docs` is
 * the raw docs.md — compared by length so the snapshot stays readable.
 */
import { describe, it, expect } from 'vitest'
import { catalog } from '../../src/lib/koan/catalog'
import type { DemoMeta } from '../../src/lib/koan/types'

function comparable(meta: DemoMeta): Record<string, unknown> {
	const { load, preview, docs, ...rest } = meta
	return {
		...rest,
		load: typeof load,
		...(preview ? { preview: typeof preview } : {}),
		...(docs === undefined ? {} : { docsLength: docs.length })
	}
}

describe('demo metadata', () => {
	it.each(catalog.map((meta) => [meta.id, meta] as const))('%s is unchanged', (_, meta) => {
		expect(comparable(meta)).toMatchSnapshot()
	})
})
