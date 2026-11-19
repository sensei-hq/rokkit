# select-trigger-id — acceptance

## Given a Select with an id

- **Given** `<Select id="color" items={...}>`
- **When** rendering
- **Then** `[data-select-trigger]` has `id="color"`

## Given a Select without an id

- **Given** `<Select items={...}>` with no `id`
- **When** rendering
- **Then** the trigger carries no `id` attribute

## Given a form enum field

- **Given** a FormRenderer string-enum field named `color`
- **When** rendering
- **Then** `label[for="color"]` exists and exactly one element —
  the select trigger — has `id="color"`
