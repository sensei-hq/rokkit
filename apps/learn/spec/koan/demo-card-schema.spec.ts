/* Every demo keeps its card in `meta.json`, and every card is checked against
 * `demo-card.schema.json`. A JSON import widens `"feedback"` to `string`, so the compiler
 * cannot hold a card to `DemoCard`'s unions — this schema is the type check for the data.
 * The same schema gives editors completion and squiggles through each file's `$schema`.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import Ajv from 'ajv'

const koan = join(import.meta.dirname, '../../src/lib/koan')
const demosDir = join(koan, 'demos')
const demos = readdirSync(demosDir, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => d.name)

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const schemaPath = join(koan, 'demo-card.schema.json')
const validate = () => new Ajv().compile(read(schemaPath))

const card = {
	id: 'thing',
	title: 'Thing',
	description: 'A thing.',
	keywords: ['thing'],
	category: 'layout',
	icon: '物'
}

describe('demo cards', () => {
	it.each(demos)('%s keeps its card in meta.json and its loader in a defineDemo meta.ts', (id) => {
		expect(existsSync(join(demosDir, id, 'meta.json'))).toBe(true)
		expect(readFileSync(join(demosDir, id, 'meta.ts'), 'utf8')).toContain('defineDemo(')
	})

	it.each(demos.filter((id) => existsSync(join(demosDir, id, 'meta.json'))))(
		'%s/meta.json matches the schema and points at it',
		(id) => {
			const json = read(join(demosDir, id, 'meta.json'))
			const check = validate()
			expect(check(json), JSON.stringify(check.errors)).toBe(true)
			expect(json.$schema).toBe('../../demo-card.schema.json')
			expect(json.id).toBe(id)
		}
	)

	it('accepts a minimal card and the full optional surface', () => {
		const check = validate()
		expect(check(card)).toBe(true)
		const full = {
			...card,
			$schema: '../../demo-card.schema.json',
			tool: { name: 'mount_thing', description: 'Mount it.', parameters: { size: 'sm | lg' } },
			inline: { capable: true, propSchema: { size: 'string' }, defaultProps: { size: 'sm' } },
			variants: [{ id: 'big', label: 'Big', mode: 'dynamic', props: { size: 'lg' } }],
			props: {
				size: { type: 'enum', options: ['sm', 'lg'], default: 'sm', label: 'Size' },
				open: { type: 'boolean', default: false },
				name: { type: 'string', default: '', placeholder: 'Name' },
				count: { type: 'number', default: 1, min: 0, max: 9, step: 1 }
			},
			api: {
				props: [{ name: 'size', type: 'string', default: "'sm'", desc: 'Size', bindable: true }],
				events: [{ name: 'onchange', signature: '(value) => void', desc: 'Changed' }],
				attrs: [{ selector: '[data-thing]', desc: 'Root' }]
			}
		}
		expect(check(full), JSON.stringify(check.errors)).toBe(true)
	})

	it.each([
		['an unknown category', { ...card, category: 'widgets' }],
		['a missing title', { ...card, title: undefined }],
		['an unknown key', { ...card, colour: 'red' }],
		['a variant with an unknown mode', { ...card, variants: [{ id: 'a', label: 'A', mode: 'popup' }] }],
		['a prop schema with a mistyped default', { ...card, props: { open: { type: 'boolean', default: 'no' } } }],
		['an api prop without desc', { ...card, api: { props: [{ name: 'size', type: 'string' }] } }],
		['snippets, which live in snippets.md', { ...card, snippets: [] }],
		['docs, which live in docs.md', { ...card, docs: '# Docs' }]
	])('rejects %s', (_, bad) => {
		expect(validate()(JSON.parse(JSON.stringify(bad)))).toBe(false)
	})
})
