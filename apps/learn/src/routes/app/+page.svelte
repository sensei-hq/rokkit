<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellLanding } from '#lib/koan/shell.svelte.ts'

	onMount(() => {
		setShellLanding()
	})
</script>
