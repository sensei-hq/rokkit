import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'

import InputMultiSelect from '../../src/input/InputMultiSelect.svelte'

describe('InputMultiSelect', () => {
	beforeEach(() => cleanup())

	it('should render with string options', async () => {
		const onchange = vi.fn()
		const props = $state({
			value: [],
			options: ['foo', 'bar', 'baz'],
			onchange
		})
		const { container } = render(InputMultiSelect, { props })

		expect(container.querySelector('[data-multiselect]')).toBeTruthy()
		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger).toBeTruthy()

		await fireEvent.click(trigger)
		expect(container.querySelectorAll('[data-select-option]')).toHaveLength(3)

		await fireEvent.click(container.querySelectorAll('[data-select-option]')[1])
		expect(onchange).toHaveBeenCalledWith(['bar'], expect.anything())
	})

	it('forwards id to the trigger (#194 pattern)', () => {
		const props = $state({ value: [], options: ['foo', 'bar'], id: 'tags' })
		const { container } = render(InputMultiSelect, { props })
		expect(container.querySelector('[data-select-trigger]')?.id).toBe('tags')
	})

	it('binds the array value', async () => {
		const props = $state({ value: ['foo'], options: ['foo', 'bar'] })
		const { container } = render(InputMultiSelect, { props })
		await fireEvent.click(container.querySelector('[data-select-trigger]'))
		await fireEvent.click(container.querySelectorAll('[data-select-option]')[1])
		expect(props.value).toEqual(['foo', 'bar'])
	})

	it('forwards disabled and placeholder', () => {
		const props = $state({
			value: [],
			options: ['foo'],
			disabled: true,
			placeholder: 'Pick some'
		})
		const { container } = render(InputMultiSelect, { props })
		expect(container.querySelector('[data-select-trigger]')?.hasAttribute('disabled')).toBe(true)
		expect(container.querySelector('[data-select-placeholder]')?.textContent).toContain('Pick some')
	})

	it('renders with minimal props', () => {
		const props = $state({})
		const { container } = render(InputMultiSelect, { props })
		expect(container.querySelector('[data-multiselect]')).toBeTruthy()
	})
})
