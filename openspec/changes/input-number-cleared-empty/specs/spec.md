# input-number-cleared-empty — acceptance

## Given a number box typed into and cleared

- **Given** an `InputNumber` (or generic `Input` with `type="number"`)
  holding 3, cleared by the user
- **When** the change commits
- **Then** `value` is `undefined` and `onchange` fires with `undefined`
  (never NaN)

## Given the issue repro at validation level

- **Given** schema `{type:'object', properties:{budget:{type:'number'}}}`
  with data `{budget: undefined}` after a clear
- **When** `validateAll` runs
- **Then** no error for `budget` when optional, and "is required"
  (not "must be a valid number") when required

## Given an explicit programmatic NaN

- **Given** `validateField(NaN, {type:'number'})` called directly
- **When** validating
- **Then** it still reports "must be a valid number" (unchanged)
