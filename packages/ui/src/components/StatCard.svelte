<script lang="ts">
	/**
	 * One number and what it counts: the mark and label on top, the value below them, at the
	 * card's end, and an optional description under it. A card with `onclick` is a button (a
	 * toggle when `pressed` is given); a card with `href` links its value, and the link covers the
	 * card; a card with neither is a plain frame.
	 */
	import type { Snippet } from 'svelte'
	import type { StatCardProps } from '../types/stat-card.js'

	const {
		label,
		value,
		icon,
		mark,
		description,
		reserveDescription = false,
		tone,
		href,
		onclick,
		pressed = false,
		span,
		class: className = '',
		...rest
	}: StatCardProps = $props()

	const text = $derived(typeof value === 'number' ? value.toLocaleString('en-US') : value)
	const interactive = $derived(Boolean(onclick || href))
	const markSnippet = $derived(typeof mark === 'function' ? (mark as Snippet) : undefined)
	const markText = $derived(typeof mark === 'string' ? mark : undefined)
	const showDescription = $derived(Boolean(description) || reserveDescription)
</script>

{#snippet content()}
	<span data-stat-card-head>
		{#if icon}
			<span data-stat-card-icon class={icon} aria-hidden="true"></span>
		{:else if markSnippet}
			{@render markSnippet()}
		{:else if markText}
			<span data-stat-card-mark aria-hidden="true">{markText}</span>
		{/if}
		<span data-stat-card-label>{label}</span>
	</span>
	{#if href}
		<a data-stat-card-value {href}>{text}</a>
	{:else}
		<span data-stat-card-value>{text}</span>
	{/if}
	{#if showDescription}
		<span data-stat-card-description aria-hidden={description ? undefined : 'true'}
			>{description ?? ''}</span
		>
	{/if}
{/snippet}

{#if onclick}
	<button
		{...rest}
		type="button"
		data-stat-card
		data-stat-card-interactive
		data-tone={tone}
		data-span={span}
		style:--stat-card-span={span}
		class={className || undefined}
		aria-pressed={pressed}
		{onclick}
	>
		{@render content()}
	</button>
{:else}
	<div
		{...rest}
		data-stat-card
		data-stat-card-interactive={interactive || undefined}
		data-tone={tone}
		data-span={span}
		style:--stat-card-span={span}
		class={className || undefined}
	>
		{@render content()}
	</div>
{/if}
