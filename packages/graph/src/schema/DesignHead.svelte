<script lang="ts">
	/**
	 * The head of an object's page: its qualified name — the schema a lead-in to the name, not a
	 * line above it — and its badges. Internal: the pages compose it; it is not exported.
	 */
	let { schema, name, badges = [] }: { schema: string; name: string; badges?: string[] } = $props()
</script>

<header data-graph-design-head>
	<div data-graph-design-heading>
		<span data-graph-design-name
			><span data-graph-design-schema>{schema}.</span>
			<h1 data-graph-design-title>{name}</h1></span
		>
		{#each badges as badge, i (i)}
			<span data-graph-design-badge>{badge}</span>
		{/each}
	</div>
</header>
