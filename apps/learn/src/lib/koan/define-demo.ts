/* A demo kept as files rather than one large literal: `meta.json` holds the card — what the
 * catalogue, the chat tools and the API tab read — `snippets.md` the Source-tab examples and
 * `docs.md` the long-form docs. The meta module is left with the code: which component to load.
 */
import { parseSnippets } from './snippets'
import type { DemoMeta } from './types'

/** Everything about a demo that is data — its meta minus the loaders, snippets and docs. */
export type DemoCard = Omit<DemoMeta, 'load' | 'preview' | 'snippets' | 'docs'>

/** The parts of a demo that live beside its card: the loader, and the raw markdown files. */
export type DemoFiles = Pick<DemoMeta, 'load'> & { snippets: string; docs: string }

export function defineDemo(card: DemoCard, { load, snippets, docs }: DemoFiles): DemoMeta {
	return { ...card, load, snippets: parseSnippets(snippets), docs }
}
