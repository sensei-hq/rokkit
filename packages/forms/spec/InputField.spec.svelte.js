import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import InputField from '../src/InputField.svelte'

function renderField(overrides = {}) {
	const props = $state({ name: 'color', label: 'Color', type: 'text', ...overrides })
	return render(InputField, { props })
}

function fieldRoot(container) {
	return container.querySelector('[data-field-root]')
}

describe('InputField boolean attributes (#207)', () => {
	// Theme disabled rules match on attribute PRESENCE, so a "false" value
	// still fades the field. Boolean attributes must be "true" or absent —
	// the same shape `data-field-dirty` already uses.

	it('omits data-field-disabled when enabled', () => {
		const { container } = renderField({ disabled: false })
		expect(fieldRoot(container).hasAttribute('data-field-disabled')).toBe(false)
	})

	it('renders data-field-disabled="true" when disabled', () => {
		const { container } = renderField({ disabled: true })
		expect(fieldRoot(container).getAttribute('data-field-disabled')).toBe('true')
	})

	it('omits data-field-required when not required', () => {
		const { container } = renderField({ required: false })
		expect(fieldRoot(container).hasAttribute('data-field-required')).toBe(false)
	})

	it('renders data-field-required="true" when required', () => {
		const { container } = renderField({ required: true })
		expect(fieldRoot(container).getAttribute('data-field-required')).toBe('true')
	})

	it('omits data-field-empty when a value is present', () => {
		const { container } = renderField({ value: 'red' })
		expect(fieldRoot(container).hasAttribute('data-field-empty')).toBe(false)
	})

	it('renders data-field-empty="true" when value is null', () => {
		const { container } = renderField({ value: null })
		expect(fieldRoot(container).getAttribute('data-field-empty')).toBe('true')
	})

	it('renders data-field-empty="true" when value is undefined', () => {
		const { container } = renderField({ value: undefined })
		expect(fieldRoot(container).getAttribute('data-field-empty')).toBe('true')
	})

	it('omits data-has-icon when no icon', () => {
		const { container } = renderField({})
		expect(fieldRoot(container).hasAttribute('data-has-icon')).toBe(false)
	})

	it('renders data-has-icon="true" when an icon is set', () => {
		const { container } = renderField({ icon: 'i-star' })
		expect(fieldRoot(container).getAttribute('data-has-icon')).toBe('true')
	})
})
