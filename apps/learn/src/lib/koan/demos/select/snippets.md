## Basic — array of objects {#intro}

```svelte
<script>
  import { Select } from '@rokkit/ui'
  const items = [
    { label: 'Light', value: 'light' },
    { label: 'Dark',  value: 'dark' },
    { label: 'Auto',  value: 'auto' }
  ]
  let mode = $state('light')
</script>

<Select {items} bind:value={mode} placeholder="Pick theme mode" />
```

## Field mapping {#fields}

```svelte
<Select
  items={countries}
  fields={{ label: 'name', value: 'code', icon: 'flag' }}
  bind:value={countryCode}
/>
```

## Filterable — type to narrow {#filterable}

```svelte
<Select
  items={countries}
  fields={{ label: 'name', value: 'code' }}
  filterable
  filterPlaceholder="Type a country…"
/>
```

## Icons, badges, descriptions — all data (no snippet) {#defaults}

```svelte
<Select items={[
  { label: 'Dashboard', icon: 'i-lucide:layout-dashboard', value: 'dashboard' },
  { label: 'Reports',   icon: 'i-lucide:bar-chart',        value: 'reports',   badge: 'New' },
  { label: 'Archive',   icon: 'i-lucide:archive',          value: 'archive',   description: 'Older records', shortcut: '⌘A' }
]} bind:value />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     badge, description, shortcut all render automatically in the dropdown.
     The trigger always shows icon + label of the selected option. -->
```

## Custom markup for one group + one option (Tier 2) {#named}

```svelte
<script>
  const items = [
    { label: 'Plans', snippet: 'header', children: [
      { label: 'Pro',  value: 'pro',  snippet: 'premium', icon: 'i-lucide:star' },
      { label: 'Free', value: 'free' }  // stays default
    ]},
    { label: 'Legacy', children: [
      { label: 'Basic', value: 'basic' }
    ]}                                   // group stays default
  ]
</script>

<Select {items} bind:value>
  {#snippet header(proxy)}
    <span class="i-lucide:layers" aria-hidden="true"></span>
    <span>{proxy.label}</span>
  {/snippet}
  {#snippet premium(proxy)}
    <span class={proxy.icon} aria-hidden="true"></span>
    <span class="flex-1">{proxy.label}</span>
    <span data-item-badge>PRO</span>
  {/snippet}
</Select>
```

## Theme via class (UnoCSS arbitrary variants) {#theming}

```svelte
<Select {items} bind:value class="
  [&_[data-select-option]]:py-2
  [&_[data-select-option][data-selected]]:font-semibold
  [&_[data-item-badge]]:text-xs [&_[data-item-badge]]:text-ink-mute
  [&_[data-select-group-label]]:uppercase [&_[data-select-group-label]]:text-xs
" />
```
