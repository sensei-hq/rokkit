<script lang="ts">
	/**
	 * The info band: up to three columns on a wash of one role — a framing column (eyebrow,
	 * large mark, display title, lead), a how-to column (steps, each mark in a paper circle) and
	 * a stat column after a hairline (a value, its total and a meter). Each column is data, or a
	 * snippet drawn in the column's frame. Text stays ink; only the wash and the eyebrows take
	 * the role.
	 */
	import type { Snippet } from 'svelte'
	import type { GlyphMode, InfoColumn, InfoRole, InfoSlot } from '../types/screen-shell.js'

	interface Props {
		columns: InfoSlot[]
		role?: InfoRole
		glyphs?: GlyphMode
		class?: string
	}

	const { columns, role = 'accent', glyphs = 'text', class: className = '' }: Props = $props()

	const isSnippet = (slot: InfoSlot): slot is Snippet => typeof slot === 'function'
	const percent = (progress: number) => `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`
</script>

{#snippet mark(kanji: string | undefined, icon: string | undefined, part: string)}
	{#if glyphs === 'icon' && icon}
		<span {...{ [`data-screen-info-${part}`]: '' }} class={icon} aria-hidden="true"></span>
	{:else if kanji}
		<span {...{ [`data-screen-info-${part}`]: '' }} aria-hidden="true">{kanji}</span>
	{/if}
{/snippet}

{#snippet column(info: InfoColumn)}
	<span data-screen-info-label>{info.label}</span>
	{#if info.kanji || info.icon || info.title}
		<div data-screen-info-heading>
			{@render mark(info.kanji, info.icon, 'mark')}
			{#if info.title}<p data-screen-info-title>{info.title}</p>{/if}
		</div>
	{/if}
	{#if info.value !== undefined}
		<div data-screen-info-figure>
			<span data-screen-info-value>{info.value}</span>
			{#if info.total !== undefined}<span data-screen-info-total>/ {info.total}</span>{/if}
		</div>
	{/if}
	{#if info.progress !== undefined}
		<div
			data-screen-info-meter
			role="meter"
			aria-label={info.label}
			aria-valuemin={0}
			aria-valuemax={1}
			aria-valuenow={info.progress}
		>
			<span data-screen-info-meter-fill style:inline-size={percent(info.progress)}></span>
		</div>
	{/if}
	{#if info.steps?.length}
		<ol data-screen-info-steps>
			{#each info.steps as step, index (index)}
				<li data-screen-info-step>
					<span data-screen-info-step-seal>{@render mark(step.kanji, step.icon, 'step-mark')}</span>
					<div data-screen-info-step-body>
						<span data-screen-info-step-title>{step.title}</span>
						{#if step.text}<span data-screen-info-step-text>{step.text}</span>{/if}
					</div>
				</li>
			{/each}
		</ol>
	{/if}
	{#if info.text}<p data-screen-info-text>{info.text}</p>{/if}
{/snippet}

<div data-screen-info data-role={role} class={className || undefined}>
	{#each columns.slice(0, 3) as slot, index (index)}
		<div data-screen-info-column>
			{#if isSnippet(slot)}
				{@render slot()}
			{:else}
				{@render column(slot)}
			{/if}
		</div>
	{/each}
</div>
