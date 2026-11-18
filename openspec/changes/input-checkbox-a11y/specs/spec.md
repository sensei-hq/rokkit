# input-checkbox-a11y — acceptance

## Given the custom variant renders

- **Given** `InputCheckbox` with default (`custom`) variant
- **When** inspecting the DOM
- **Then** no element with `tabindex` carries or sits under
  `aria-hidden="true"` (axe `aria-hidden-focus` clean)

## Given keyboard interaction

- **Given** focus in the custom checkbox's native input
- **When** pressing Space
- **Then** the value toggles and `onchange` fires, with no page scroll
- **When** pressing Enter
- **Then** nothing happens (native checkbox behavior)

## Given pointer interaction

- **Given** the custom variant's icon
- **When** clicking the icon (mouse, touch, or `fireEvent.click`)
- **Then** the value toggles exactly once via the native input path

## Given the default variant

- **Given** `variant="default"`
- **When** rendering
- **Then** a visible native checkbox with no icon span (unchanged)
