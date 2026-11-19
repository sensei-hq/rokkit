<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { numberOrEmpty } from '../lib/values.js'

	type Props = Omit<HTMLInputAttributes, 'value' | 'onchange'> & {
		value?: number
		onchange?: (value: number | undefined) => void
	}

	let {
		value = $bindable(),
		onchange,
		onfocus,
		onblur,
		min,
		max,
		step,
		placeholder,
		required,
		disabled,
		readonly,
		name,
		id,
		autocomplete,
		...rest
	}: Props = $props()

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		value = numberOrEmpty(event.currentTarget.valueAsNumber)
		onchange?.(value)
	}
</script>

<input
	bind:value
	type="number"
	{min}
	{max}
	{step}
	{placeholder}
	{required}
	{disabled}
	{readonly}
	{name}
	{id}
	{autocomplete}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
