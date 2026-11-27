## Basic — sign-up form {#intro}

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  const schema = {
    type: 'object',
    properties: {
      name:    { type: 'string', minLength: 2 },
      email:   { type: 'string', format: 'email' },
      age:     { type: 'integer', minimum: 13 },
      consent: { type: 'boolean' }
    },
    required: ['name', 'email', 'consent']
  }
  let data = $state({ name: '', email: '', age: null, consent: false })
</script>

<FormRenderer bind:data {schema} onsubmit={(d) => console.log(d)} />
```

## Enum → radio / select {#enum}

```svelte
const schema = {
  type: 'object',
  properties: {
    plan: {
      type: 'string',
      enum: ['Free', 'Pro', 'Team']
    }
  }
}
```

## Layout — group fields into rows {#layout}

```svelte
const layout = {
  type: 'vertical',
  elements: [
    { type: 'horizontal', elements: [
      { scope: '#/firstName' },
      { scope: '#/lastName' }
    ]},
    { scope: '#/email' }
  ]
}

<FormRenderer bind:data {schema} {layout} />
```

## Async lookups {#lookups}

```svelte
const lookups = {
  '#/countryCode': {
    url: '/api/countries?prefix={query}',
    label: 'name',
    value: 'code'
  },
  '#/city': {
    fetch: async ({ data }) => fetchCities(data.countryCode)
  }
}

<FormRenderer bind:data {schema} {lookups} />
```
