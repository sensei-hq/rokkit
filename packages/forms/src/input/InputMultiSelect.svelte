<script lang="ts">
	import { MultiSelect } from '@rokkit/ui'

	type Option = string | Record<string, unknown>

	type Props = {
		value?: unknown[]
		fields?: Record<string, string>
		options?: Option[]
		placeholder?: string
		disabled?: boolean
		size?: 'sm' | 'md' | 'lg'
		id?: string
		onchange?: (values: unknown[], items: unknown[]) => void
	}

	let {
		value = $bindable(),
		fields,
		options = [],
		placeholder,
		disabled = false,
		size,
		id,
		onchange,
		..._rest
	}: Props = $props()
</script>

<MultiSelect
	items={options}
	{fields}
	bind:value
	{placeholder}
	{disabled}
	{size}
	{id}
	{onchange}
/>
