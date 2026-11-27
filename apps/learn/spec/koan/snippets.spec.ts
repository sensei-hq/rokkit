import { describe, it, expect } from 'vitest'
import { parseSnippets } from '../../src/lib/koan/snippets'

describe('parseSnippets', () => {
	it('reads each `## title {#id}` heading and its fenced code, in order', () => {
		const md = [
			'## Basic — array of objects {#intro}',
			'',
			'```svelte',
			'<List {items} />',
			'```',
			'',
			'## Field mapping {#mapping}',
			'',
			'```ts',
			'const a = 1',
			'',
			'const b = 2',
			'```',
			''
		].join('\n')
		expect(parseSnippets(md)).toEqual([
			{ id: 'intro', title: 'Basic — array of objects', lang: 'svelte', code: '<List {items} />' },
			{ id: 'mapping', title: 'Field mapping', lang: 'ts', code: 'const a = 1\n\nconst b = 2' }
		])
	})

	it('leaves `lang` out when the fence names none', () => {
		expect(parseSnippets('## Plain {#plain}\n\n```\nx\n```\n')).toEqual([{ id: 'plain', title: 'Plain', code: 'x' }])
	})

	it('keeps a shorter fence and `##` lines inside a longer fence as code', () => {
		const md = '## Nested {#nested}\n\n````md\n## not a heading\n```js\nx\n```\n````\n'
		expect(parseSnippets(md)).toEqual([
			{ id: 'nested', title: 'Nested', lang: 'md', code: '## not a heading\n```js\nx\n```' }
		])
	})

	it('is empty for markdown with no snippets', () => {
		expect(parseSnippets('')).toEqual([])
	})
})
