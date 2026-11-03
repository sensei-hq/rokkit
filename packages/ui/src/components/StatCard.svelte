<script lang="ts">
	/**
	 * One number and what it counts: the icon and label on top, the value below them, at the
	 * card's end. A value with somewhere to go links there.
	 */
	import type { StatCardProps } from '../types/stat-card.js'

	const { label, value, icon, tone, href, class: className = '', ...rest }: StatCardProps = $props()

	const text = $derived(typeof value === 'number' ? value.toLocaleString('en-US') : value)
</script>

<div {...rest} data-stat-card data-tone={tone} class={className || undefined}>
	<span data-stat-card-head>
		{#if icon}<span data-stat-card-icon class={icon} aria-hidden="true"></span>{/if}
		<span data-stat-card-label>{label}</span>
	</span>
	{#if href}
		<a data-stat-card-value {href}>{text}</a>
	{:else}
		<span data-stat-card-value>{text}</span>
	{/if}
</div>
