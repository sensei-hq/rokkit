import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputCheckbox from '../../src/input/InputCheckbox.svelte'

describe('InputCheckbox', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: true })
		const { container } = render(InputCheckbox, { props })
		expect(container).toMatchSnapshot()

		props.value = false
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			disabled: true
		})
		const { container } = render(InputCheckbox, { props })
		const element = container.querySelector('input')
		expect(element.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(element.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({
			value: null,
			required: true
		})
		const { container } = render(InputCheckbox, { props })
		const element = container.querySelector('input')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})

	it('should update value on click', async () => {
		const props = $state({ value: true, onchange: vi.fn() })
		const { container } = render(InputCheckbox, { props })

		await fireEvent.click(container.querySelector('input'))
		expect(props.value).toBe(false)
		expect(props.onchange).toHaveBeenCalledTimes(1)

		await fireEvent.click(container.querySelector('input'))
		expect(props.value).toBe(true)
		expect(props.onchange).toHaveBeenCalledTimes(2)
	})

	it('should update value on space key', async () => {
		const props = $state({ value: true, onfocus: vi.fn(), onchange: vi.fn() })
		const { container } = render(InputCheckbox, { props })

		const element = container.querySelector('input')
		await fireEvent.focus(element)
		expect(props.onfocus).toHaveBeenCalledTimes(1)

		await userEvent.type(element, '{space}')
		await tick()
		expect(element.checked).toBe(false)
		expect(props.value).toBe(false)
		expect(props.onchange).toHaveBeenCalledTimes(1)

		await userEvent.type(element, '{space}')
		expect(element.checked).toBe(true)
		expect(props.value).toBe(true)
	})


	// ─── Icon clicks forward to the native input ─────

	it('clicking the icon toggles the value and fires onchange', async () => {
		const onchange = vi.fn()
		const props = $state({ value: false, variant: 'custom', onchange })
		const { container } = render(InputCheckbox, { props })
		await fireEvent.click(container.querySelector('[data-checkbox-icon]'))
		expect(onchange).toHaveBeenCalledWith(true)
	})

	it('toggling from true goes back to false', async () => {
		const onchange = vi.fn()
		const props = $state({ value: true, variant: 'custom', onchange })
		const { container } = render(InputCheckbox, { props })
		await fireEvent.click(container.querySelector('[data-checkbox-icon]'))
		expect(onchange).toHaveBeenCalledWith(false)
	})

	it('clicking the icon does nothing when disabled', async () => {
		const onchange = vi.fn()
		const props = $state({ value: false, disabled: true, onchange })
		const { container } = render(InputCheckbox, { props })
		await fireEvent.click(container.querySelector('[data-checkbox-icon]'))
		expect(props.value).toBe(false)
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Accessibility: the native input is the control (issue #190) ────────

	it('puts no focusable control under aria-hidden in the custom variant', () => {
		const props = $state({ value: false })
		const { container } = render(InputCheckbox, { props })
		const input = container.querySelector('input')
		expect(input.hasAttribute('hidden')).toBe(false)
		expect(input.tabIndex).toBe(0)
		const violations = [
			...container.querySelectorAll('[aria-hidden="true"][tabindex]'),
			...container.querySelectorAll('[aria-hidden="true"] [tabindex]')
		]
		expect(violations).toHaveLength(0)
	})

	it('renders the icon as decorative and forwards its clicks to the input', async () => {
		const onchange = vi.fn()
		const props = $state({ value: false, onchange })
		const { container } = render(InputCheckbox, { props })
		const icon = container.querySelector('[data-checkbox-icon]')
		expect(icon.getAttribute('aria-hidden')).toBe('true')
		expect(icon.hasAttribute('tabindex')).toBe(false)
		expect(icon.hasAttribute('role')).toBe(false)

		await fireEvent.click(icon)
		expect(props.value).toBe(true)
		expect(onchange).toHaveBeenCalledTimes(1)
		expect(onchange).toHaveBeenCalledWith(true)
	})

	it('ignores key presses on the icon (keyboard goes through the native input)', async () => {
		const onchange = vi.fn()
		const props = $state({ value: false, onchange })
		const { container } = render(InputCheckbox, { props })
		const icon = container.querySelector('[data-checkbox-icon]')
		await fireEvent.keyDown(icon, { key: ' ' })
		await fireEvent.keyDown(icon, { key: 'Enter' })
		expect(onchange).not.toHaveBeenCalled()
		expect(props.value).toBe(false)
	})

	it('Enter on the input does nothing (native checkbox behavior)', async () => {
		const onchange = vi.fn()
		const props = $state({ value: false, onchange })
		const { container } = render(InputCheckbox, { props })
		const element = container.querySelector('input')
		// fireEvent, not userEvent.type: type() clicks as part of typing.
		await fireEvent.keyDown(element, { key: 'Enter' })
		await tick()
		expect(props.value).toBe(false)
		expect(onchange).not.toHaveBeenCalled()
	})

	it('default variant renders a visible native checkbox with no icon', () => {
		const props = $state({ value: false, variant: 'default' })
		const { container } = render(InputCheckbox, { props })
		const input = container.querySelector('input')
		expect(input.hasAttribute('hidden')).toBe(false)
		expect(container.querySelector('[data-checkbox-icon]')).toBeNull()
	})
})
