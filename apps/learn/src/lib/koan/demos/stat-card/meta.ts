import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'stat-card',
	title: 'StatCard',
	description: 'One number and what it counts — icon and label on top, the value below at the end.',
	keywords: ['stat', 'stats', 'statistic', 'kpi', 'metric', 'count', 'number', 'card', 'summary'],
	category: 'data',
	icon: '数',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_stat_card',
		description: 'Mount a StatCard gallery — counts with icons, tones, and linked values.',
		parameters: {
			label: 'what the number counts',
			value: 'number or text',
			tone: 'danger | warning | success | muted'
		}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'label', type: 'string', desc: 'What the number counts' },
			{
				name: 'value',
				type: 'number | string',
				desc: 'The number (grouped as en-US), or a value already written as text'
			},
			{ name: 'icon', type: 'string', desc: 'Icon class drawn before the label' },
			{
				name: 'tone',
				type: "'danger' | 'warning' | 'success' | 'muted'",
				desc: 'The tone the value is read in; none is plain ink'
			},
			{ name: 'href', type: 'string', desc: 'Links the value when something shows it' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		attrs: [
			{ selector: '[data-stat-cards]', desc: 'Optional grid wrapper for a row of cards' },
			{ selector: '[data-stat-card]', desc: 'Root (carries data-tone)' },
			{ selector: '[data-stat-card-head]', desc: 'The icon and label line' },
			{ selector: '[data-stat-card-icon]', desc: 'The icon' },
			{ selector: '[data-stat-card-label]', desc: 'The label' },
			{ selector: '[data-stat-card-value]', desc: 'The value — an <a> when href is set' }
		]
	},
	snippets: [
		{
			id: 'row',
			title: 'A row of counts',
			lang: 'svelte',
			code: `<div data-stat-cards>\n  <StatCard label="Tables" value={198} icon="i-glyph:table" />\n  <StatCard label="Views" value={56} icon="i-glyph:split-view" />\n</div>`
		},
		{
			id: 'tone',
			title: 'A toned, linked value',
			lang: 'svelte',
			code: `<StatCard label="Cycles" value={4} tone="warning" href="/diagrams/cycles" />`
		}
	],
	docs
}

export default meta
