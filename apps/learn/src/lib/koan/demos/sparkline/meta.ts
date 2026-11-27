import { defineDemo, type DemoCard } from '../../define-demo'
import card from './meta.json'
import docs from './docs.md?raw'

export default defineDemo(card as DemoCard, {
	load: () => import('./index.svelte'),
	docs
})
