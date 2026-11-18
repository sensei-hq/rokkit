<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	type StateIcons = {
		checked?: string
		unchecked?: string
		unknown?: string
	}

	type Props = Omit<HTMLInputAttributes, 'value' | 'onchange'> & {
		value?: boolean | null
		variant?: 'default' | 'custom'
		icons?: StateIcons
		onchange?: (value: boolean) => void
	}

	let {
		value = $bindable(),
		variant = 'custom',
		icons,
		onchange,
		onfocus,
		onblur,
		required,
		disabled,
		name,
		id,
		...rest
	}: Props = $props()

	// The native input is the control in every variant: it carries focus,
	// keyboard handling, label association, and form semantics. The custom
	// icon is decorative and forwards pointer clicks to it.
	let inputElement: HTMLInputElement | undefined = $state(undefined)

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		value = Boolean(event.currentTarget.checked)
		onchange?.(value)
	}

	let checked = $derived(Boolean(value))
	let stateIcons = $derived({ ...DEFAULT_STATE_ICONS.checkbox, ...icons })
	let icon = $derived(stateIcons[value === null || value === undefined ? 'unknown' : value ? 'checked' : 'unchecked'])
</script>

<div data-checkbox-root data-variant={variant === 'default' ? 'default' : 'custom'}>
	<input
		type="checkbox"
		bind:this={inputElement}
		{required}
		{disabled}
		{name}
		{id}
		{checked}
		onchange={handleChange}
		{onfocus}
		{onblur}
		{...rest}
	/>
	{#if variant !== 'default'}
		<span
			class={icon}
			data-checkbox-icon
			aria-hidden="true"
			onclick={() => inputElement?.click()}
		></span>
	{/if}
</div>
