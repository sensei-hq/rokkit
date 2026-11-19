# formrenderer-multiselect-textarea

Draw array-of-enum as MultiSelect and schema-hinted long text as
textarea, with validation (issue #197).

GitHub issue: [#197](https://github.com/sensei-hq/rokkit/issues/197)
(unblocks sensei#389 task R2).

## Why

Sensei's Relay draws answer schemas with `FormRenderer`, and its
daemon accepts only schema keywords the renderer draws without a
layout `renderer`. Two common answer shapes are refused: pick-several
(`array` + `items.enum` draws the `ArrayEditor` list editor) and long
text (no schema path to `InputTextArea` at all).

## What

- `resolveInputType` (`elements.js`, shared by FormRenderer and
  FormBuilder): `type: 'array'` with `items.enum` → `'multiselect'`
  (sets `props.options` from `items.enum`, mirroring the string-enum
  rule); string with `x-multiline: true` → `'textarea'`
- New forms `InputMultiSelect.svelte` wrapping ui `MultiSelect`
  (items/fields/array value/onchange + `id`/`disabled`/`size`/
  `placeholder` forwarding, following `InputSelect`); register
  `multiselect` in `defaultRenderers`
- ui `MultiSelect`: `id?: string` on `MultiSelectProps` + trigger,
  same as #194 did for `Select`
- Validation: `isEmpty` treats `[]` as empty (used only by
  `checkPresence`, so required `[]` → "is required", optional `[]`
  → skip); new `validateArray` checks per-member enum membership
  and `uniqueItems`; `maxLength` already flows through
  `validateString` (schema type stays `string`)

Out of scope: non-enum arrays (stay `ArrayEditor`); object-enum
member field mapping beyond `fields` passthrough; `minItems`.

## Evidence

- `packages/forms/src/lib/elements.js:37-67` (single shared
  resolution path; `SCHEMA_TYPE_MAP`, `stringInputType`)
- `packages/forms/src/lib/renderers.js:35-60` (no `multiselect`)
- `packages/forms/src/lib/validation.js:205-230` (no `array` case;
  `isEmpty` used only by `checkPresence`)
- No `contentMediaType`/`x-multiline` precedent anywhere in-repo

## Decisions

- Long-text hint is `x-multiline: true`, not `contentMediaType`:
  no `contentMediaType` value unambiguously means "multiline"
  (`text/plain` is the default anyway; matching `text/*` is magic),
  while the `x-` keyword is explicit and self-contained.

## Impact

- `{array, items:{enum}, uniqueItems}` draws a real multi-choice;
  long strings get a textarea from schema alone; validation matches
- Sensei widens its accepted subset + bumps `@rokkit/forms`

## Risks

- **`isEmpty([])` blast radius**: only `checkPresence` calls it and
  only array fields hold arrays — string/number/boolean paths keep
  identical behavior (pinned by existing specs).
