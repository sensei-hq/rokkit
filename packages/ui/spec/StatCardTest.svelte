<script lang="ts">
	import StatCard from '../src/components/StatCard.svelte'
	import type { StatCardProps } from '../src/types/stat-card.js'

	const props: StatCardProps = $props()
</script>

<StatCard {...props} />
