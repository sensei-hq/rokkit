import { defineDemo, type DemoCard } from '../../define-demo'
import card from './meta.json'
import snippets from './snippets.md?raw'
import docs from './docs.md?raw'

export default defineDemo(card as DemoCard, {
	load: () => import('./placeholder.svelte'),
	snippets,
	docs
})
