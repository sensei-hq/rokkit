# input-checkbox-a11y

Make the custom checkbox variant reachable and named (issue #190).

GitHub issue: [#190](https://github.com/sensei-hq/rokkit/issues/190) —
axe `aria-hidden-focus` (serious, WCAG 4.1.2).

## Why

The custom variant renders `<input type="checkbox" hidden>` plus a
focusable (`tabindex="0"`, `role="button"`) icon span under
`aria-hidden="true"`. A screen reader user reaches a control with no
name and no role; keyboard Space on the span also scrolls the page
(no `preventDefault`). The native input — carrying `required`,
`name`, `id`, focus and change handling — is inert because `hidden`
removes it from the tree.

## What

Take the issue's second option (native input stays in the tree):

- `InputCheckbox.svelte`: drop the `hidden` attribute; in the custom
  variant the input is visually hidden but focusable, and the icon
  span becomes decorative (`aria-hidden`, no `tabindex`/`role`/
  key handling) with clicks forwarded to `input.click()` — one event
  path (`handleChange`), native Space/Enter/label behavior, working
  `required`/`disabled`
- `base/input.css`: visually-hide the custom-variant input (structure)
  + positioned root; drop the dead `focus:outline-none` icon rule
- `rokkit` + `frosted` `input.css`: repoint the icon `:focus-visible`
  ring at `input:focus-visible + [data-checkbox-icon]` (the other
  styles' `:focus-within` label rules keep working unchanged)
- Normalize `data-variant` to `custom` for any non-default variant so
  the hiding rule matches (runtime already treats them identically)

Out of scope: `InputField` consuming `variant` for layout (noted in the
issue as context — unneeded once custom is accessible); `role=checkbox`
alternative (rejected: reimplements native keyboard/form semantics);
other inputs (only the checkbox icon pairs focusability with
`aria-hidden` — verified by search).

## Evidence

- `packages/forms/src/input/InputCheckbox.svelte:48-71` (hidden input +
  focusable `aria-hidden` span; Space without `preventDefault`)
- `packages/themes/src/{base,rokkit,frosted}/input.css` (icon focus rules)
- `packages/forms/src/InputField.svelte:84-87` (`<label for={name}>` +
  `id={name}` — native association already wired)
- Verify: axe `aria-hidden-focus` absent; existing + new specs green

## Impact

- Custom checkbox is a real checkbox to AT, keyboard, and forms; no API
  change (`value`/`variant`/`icons`/`onchange` unchanged)
- sensei#389's `DecisionCheckbox` workaround can go once this ships

## Risks

- **Visual drift**: the hiding/focus CSS must not move pixels — the
  input is 1px clipped, the ring lands on the same icon box.
- **No e2e coverage**: no checkbox fixture exists in `embed/` (verified
  by search), so this ships on unit + browser specs only.
