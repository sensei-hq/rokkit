/* A demo's Source-tab snippets, authored as markdown rather than template literals in its meta:
 *
 *     ## Basic — array of objects {#intro}
 *
 *     ```svelte
 *     <List {items} />
 *     ```
 *
 * The heading is the snippet's title and `{#id}` its id; the fence's info string is its `lang`
 * (left out when the fence names none). A fence closes only on a line of the same backticks, so
 * code that itself holds a fence goes inside a longer one.
 */
import type { DemoSnippet } from './types'

const SNIPPET = /^## (.+) \{#([\w-]+)\}\n\n(`{3,})(\w*)\n([\s\S]*?)\n\3$/gm

export function parseSnippets(markdown: string): DemoSnippet[] {
	return [...markdown.matchAll(SNIPPET)].map(([, title, id, , lang, code]) => ({
		id,
		title,
		...(lang ? { lang: lang as DemoSnippet['lang'] } : {}),
		code
	}))
}
