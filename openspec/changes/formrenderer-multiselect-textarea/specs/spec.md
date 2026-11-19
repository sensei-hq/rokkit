# formrenderer-multiselect-textarea — acceptance

## Given an array of enum members

- **Given** schema `{type:'array', items:{enum:['a','b']}}`
- **When** FormRenderer draws the field
- **Then** a MultiSelect renders with the enum as options, the value
  is the array of chosen members, and required means at least one

## Given a schema-hinted long string

- **Given** schema `{type:'string', x-multiline:true, maxLength:N}`
- **When** FormRenderer draws the field
- **Then** an `InputTextArea` renders and over-length input fails
  `maxLength` validation

## Given array validation

- **Given** a member outside the enum, or duplicates under
  `uniqueItems: true`
- **When** `validateAll` runs
- **Then** a member error names the offending value; duplicates error

## Given unchanged shapes

- **Given** a non-enum array, or a string without the hint
- **When** resolving
- **Then** `ArrayEditor` and `text`/`select` as before (no behavior change)
