# Tasks — input-checkbox-a11y

- [ ] Add failing a11y specs (red): no focusable element under/with `aria-hidden`, input exposed in custom variant, icon decorative + click-forwarding, Space toggles / Enter does not (native)
- [ ] Rewrite the `variant: 'icon'` specs to the new interaction model (`custom` spelling)
- [ ] Implement: `InputCheckbox.svelte` (drop `hidden`, decorative forwarding icon, delete `toggle()`)
- [ ] Theme CSS: base hide + root positioning, rokkit + frosted focus-ring repoint
- [ ] Update snapshots; run forms specs, lint, forms svelte-check, full `test:ci`
- [ ] PR to `develop`, CI green, merge; close #190
