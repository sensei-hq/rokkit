## Basic — type to narrow {#intro}

```svelte
<script>
  import { Select } from '@rokkit/ui'
  const countries = [
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil',    code: 'BR' },
    { name: 'Canada',    code: 'CA' }
    /* …195 more rows */
  ]
  let code = $state(null)
</script>

<Select
  items={countries}
  fields={{ label: 'name', value: 'code' }}
  bind:value={code}
  filterable
  filterPlaceholder="Type a country…"
/>
```

## Same items, filter off {#plain}

```svelte
<Select
  items={countries}
  fields={{ label: 'name', value: 'code' }}
  bind:value={code}
  filterable={false}
/>
```
