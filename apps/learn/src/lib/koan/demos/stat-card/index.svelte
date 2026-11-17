<script lang="ts">
	import { StatCard } from '@rokkit/ui'
	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Counts with icons</header>
		<div data-stat-cards>
			<StatCard label="Schemas" value={9} icon="i-glyph:folder" {...spread} />
			<StatCard label="Tables" value={198} icon="i-glyph:table" />
			<StatCard label="References" value={1243} icon="i-glyph:git-merge" />
		</div>
	</section>

	<section>
		<header>Tones and links</header>
		<div data-stat-cards>
			<StatCard label="Upward" value={4} tone="danger" />
			<StatCard label="Cycles" value={2} tone="warning" href="#cycles" />
			<StatCard label="Passing" value={31} tone="success" />
			<StatCard label="Same layer · down" value="12 · 30" tone="muted" />
		</div>
	</section>
</div>

<style>
	.grid {
		display: grid;
		gap: 1.5rem;
	}
	header {
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
