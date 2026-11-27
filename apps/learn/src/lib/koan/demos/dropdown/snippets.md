## Basic — bound value {#intro}

```svelte
<script>
  import { Dropdown } from '@rokkit/ui'

  const fonts = [
    { label: 'System UI', value: 'system' },
    { label: 'Serif',     value: 'serif' },
    { label: 'Mono',      value: 'mono' }
  ]

  let font = $state('system')
</script>

<Dropdown items={fonts} bind:value={font} />
```

## With placeholder + icon {#placeholder}

```svelte
<Dropdown
  items={timezones}
  bind:value={tz}
  placeholder="Select a timezone"
  icon="i-mdi:clock-outline"
/>
```

## End-aligned, up direction {#alignment}

```svelte
<Dropdown items={options} bind:value align="end" direction="up" />
```
