<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellResponse, shell } from '#lib/koan/shell.svelte.ts'

	onMount(() => {
		if (!shell.lastQuery) shell.lastQuery = 'Show me a Dropdown'
		setShellResponse('dropdown')
	})
</script>
