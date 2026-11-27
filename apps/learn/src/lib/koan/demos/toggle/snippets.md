## Segmented group {#intro}

```svelte
<Toggle
  options={[
    { label: 'List', value: 'list' },
    { label: 'Grid', value: 'grid' }
  ]}
  bind:value
/>
```

## With icons {#icons}

```svelte
<Toggle
  options={[
    { label: 'Left',  value: 'left',  icon: 'i-mdi:format-align-left' },
    { label: 'Right', value: 'right', icon: 'i-mdi:format-align-right' }
  ]}
  bind:value
/>
```

## Icons and labels are data (no snippet) {#defaults}

```svelte
<Toggle options={[
  { label: 'Day',   value: 'day',   icon: 'i-lucide:sun' },
  { label: 'Week',  value: 'week',  icon: 'i-lucide:calendar' },
  { label: 'Month', value: 'month', icon: 'i-lucide:calendar-range' }
]} bind:value />

<!-- icon takes a CSS icon class; label renders as text.
     No snippet needed — both are data. -->
```

## Custom markup for one option (Tier 2) {#named}

```svelte
<script>
  const options = [
    { label: 'Edit',   value: 'edit',  icon: 'i-lucide:pen' },
    { label: 'Pinned', value: 'pin',   snippet: 'pinned' },  // custom; others stay default
    { label: 'View',   value: 'view',  icon: 'i-lucide:eye' }
  ]
</script>

<Toggle {options} bind:value>
  {#snippet pinned(proxy, selected)}
    <span class="i-lucide:pin"></span>
    <strong class:font-bold={selected}>{proxy.label}</strong>
  {/snippet}
</Toggle>
```

## Theme via class (UnoCSS arbitrary variants) {#theming}

```svelte
<Toggle {options} bind:value class="
  [&_[data-toggle-option]]:px-4
  [&_[data-toggle-option][data-selected]]:font-semibold
  [&_[data-toggle-label]]:text-sm
" />
```
