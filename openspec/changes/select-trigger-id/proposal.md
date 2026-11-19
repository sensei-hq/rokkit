# select-trigger-id

Forward the field id to the Select trigger so labels associate (issue #194).

GitHub issue: [#194](https://github.com/sensei-hq/rokkit/issues/194).

## Why

`InputField` renders `<label for={name}>` and passes `id={name}` down,
but `InputSelect` drops it in `..._rest` and ui `Select` takes no `id`
at all — so no element carries the id, the label points at nothing,
clicking it does nothing, and the trigger has no programmatic label.

## What

- ui `Select`: accept `id?: string` (`SelectProps`, not the shared
  base — siblings wire their own in their own changes) and render it
  on the trigger `<button>` (a labelable element); omitted when absent
- forms `InputSelect`: accept `id` and forward it to `Select`
- Tests at three levels: trigger carries id / omits it; InputSelect
  forwards; FormRenderer enum field has `label[for]` === trigger `id`

Out of scope: MultiSelect trigger id (comes with #197's MultiSelect
renderer); `name` forwarding (a button dropdown submits nothing);
Dropdown.

## Evidence

- `packages/forms/src/input/InputSelect.svelte:16-25,43-51`
  (`..._rest` dropped, `id` never forwarded)
- `packages/ui/src/components/Select.svelte:54-73,336-343`
  (closed props, trigger without `id`)
- `packages/forms/src/InputField.svelte:84-87` (`for`/`id` wiring
  already correct upstream)
- Repro: FormRenderer enum string field → `label[for]` exists, no
  matching `id` in the DOM today

## Impact

- Label click focuses/activates the trigger; AT announces the label
- No API break: `id` is optional, omitted when absent

## Risks

- **Duplicate ids**: one field renders one trigger — the id stays
  unique per field as with native inputs.
