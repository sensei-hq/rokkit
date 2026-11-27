import { describe, it, expect } from 'vitest'
import { defineDemo, type DemoCard } from '../../src/lib/koan/define-demo'

const card: DemoCard = {
	id: 'thing',
	title: 'Thing',
	description: 'A thing.',
	keywords: ['thing'],
	category: 'layout',
	icon: '物',
	inline: { capable: true },
	variants: [],
	api: { props: [{ name: 'size', type: 'string', desc: 'Size' }] }
}

describe('defineDemo', () => {
	it('joins the card, the loader, the parsed snippets and the docs into one meta', () => {
		const load = () => Promise.resolve({ default: (() => {}) as never })
		const meta = defineDemo(card, { load, snippets: '## Basic {#intro}\n\n```svelte\n<Thing />\n```\n', docs: '# Docs' })
		expect(meta).toEqual({
			...card,
			load,
			snippets: [{ id: 'intro', title: 'Basic', lang: 'svelte', code: '<Thing />' }],
			docs: '# Docs'
		})
	})

	it('drops the $schema pointer that meta.json carries for editors', () => {
		const load = () => Promise.resolve({ default: (() => {}) as never })
		const withSchema = { ...card, $schema: '../../demo-card.schema.json' } as DemoCard
		const meta = defineDemo(withSchema, { load, snippets: '', docs: '' })
		expect(meta).not.toHaveProperty('$schema')
	})

	it('leaves snippets out for a demo that has none', () => {
		const load = () => Promise.resolve({ default: (() => {}) as never })
		const meta = defineDemo(card, { load, docs: '' })
		expect(meta).not.toHaveProperty('snippets')
	})
})
