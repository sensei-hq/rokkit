# input-number-cleared-empty

A cleared number box reports `undefined`, not NaN (issue #193).

GitHub issue: [#193](https://github.com/sensei-hq/rokkit/issues/193).

## Why

`InputNumber.handleChange` assigns `event.currentTarget.valueAsNumber`,
which is `NaN` when the box is cleared. `validation.js isEmpty` counts
only `undefined`/`null`/`''`, so a cleared optional field fails with
"must be a valid number" and blocks submit; a cleared required field
says "must be a valid number" instead of "is required". NaN also
poisons the data itself (comparisons, display, JSON).

## What

Fix at the source (the issue's first option), in both places that read
`valueAsNumber` from a clearable box:

- `InputNumber.svelte handleChange`: `NaN` → `undefined`; widen
  `onchange` to `(value: number | undefined) => void`
- `lib/Input.svelte resolveValue`: same NaN → `undefined` mapping for
  the `number` type

Deliberately NOT changing `isEmpty`: an explicit programmatic NaN
still reads as "must be a valid number" (pinned by
`validation.spec.js:121`). `InputRange` untouched — a slider always
has a value, NaN unreachable.

Out of scope: `InputField` variant consumption (#190 follow-up note);
anything in #194/#197.

## Evidence

- `packages/forms/src/input/InputNumber.svelte:27-30`
- `packages/forms/src/lib/Input.svelte:83-93` (`resolveValue`)
- `packages/forms/src/lib/validation.js:20-22,125-133,225-230`
- Repro: schema `{budget:{type:'number'}}`, type 3, delete →
  `validateAll` errors on `budget` today, silent after the fix

## Impact

- Cleared optional numbers validate clean; cleared required numbers
  say "is required"; form data never holds NaN from these inputs
- sensei#389's NaN→undefined workaround can go once this ships

## Risks

- **Consumers testing `Number.isNaN(value)`**: none in-repo (verified
  by search — only `validation.js` + its spec mention NaN).
