## Basic — single date via FormRenderer {#intro}

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  const schema = {
    type: 'object',
    properties: {
      birthday: { type: 'string', format: 'date' }
    },
    required: ['birthday']
  }
  let data = $state({ birthday: '' })
</script>

<FormRenderer bind:data {schema} />
```

## Date + time {#datetime}

```svelte
const schema = {
  type: 'object',
  properties: {
    startsAt: { type: 'string', format: 'date-time' }
  }
}
```

## With min / max constraints {#min-max}

```svelte
const schema = {
  type: 'object',
  properties: {
    eventDate: {
      type: 'string',
      format: 'date',
      formatMinimum: '2026-01-01',
      formatMaximum: '2026-12-31'
    }
  }
}
```
