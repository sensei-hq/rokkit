<script lang="ts">
	import ScreenShell from '../../src/components/ScreenShell.svelte'
	import type { FilterApi, InfoColumn, ShellStat } from '../../src/types/screen-shell.js'

	const {
		height = 640,
		rows = 60,
		sideRows = 60
	}: { height?: number; rows?: number; sideRows?: number } = $props()

	const info: InfoColumn[] = [
		{
			label: 'Your first session',
			kanji: '稽',
			title: 'Give sensei something to watch.',
			text: 'It learns from how you and your assistant actually work.'
		},
		{
			label: 'How to start',
			steps: [
				{ kanji: '場', title: 'Pick a project', text: 'Any of the twelve sensei just found.' },
				{ kanji: '観', title: 'Just work', text: 'Sensei watches in the background.' }
			]
		},
		{
			label: 'Sessions watched',
			value: 1,
			total: 3,
			progress: 1 / 3,
			text: 'Around the third session.'
		}
	]
	const stats: ShellStat[] = [
		{
			id: 'you',
			title: 'Needs you',
			kanji: '手',
			value: 1,
			description: 'Only you can turn it on',
			filter: { key: 'who', value: 'you' }
		},
		{
			id: 'failing',
			title: 'Failing',
			kanji: '難',
			value: 2,
			tone: 'danger',
			filter: { key: 'who', value: 'failing' }
		},
		{ id: 'dojos', title: 'Dōjōs', kanji: '場', value: 3 }
	]
</script>

{#snippet band(api: FilterApi)}<span data-test-band>who: {String(api.values.who ?? 'anyone')}</span
	>{/snippet}
{#snippet side()}
	{#each { length: sideRows } as _, i (i)}<p data-test-side-row>Entity {i}</p>{/each}
{/snippet}

<div data-test-frame style:height="{height}px" style="display:flex;flex-direction:column">
	<ScreenShell
		mark={{ kanji: '結' }}
		title="Dōjō sync"
		context="@jerrythomas"
		description="Is my work reaching my dōjō?"
		{info}
		{stats}
		filters={band}
		sidebar={side}
		footer={{ left: '157 repositories scanned', mid: '4 min ago', right: 'Sync activity' }}
	>
		{#each { length: rows } as _, i (i)}<p data-test-row>Row {i}</p>{/each}
	</ScreenShell>
</div>
