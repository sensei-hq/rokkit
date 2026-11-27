## Basic — array of values {#intro}

```svelte
<script>
  import { MultiSelect } from '@rokkit/ui'
  const items = [
    { label: 'Red',   value: 'r' },
    { label: 'Green', value: 'g' },
    { label: 'Blue',  value: 'b' }
  ]
  let selected = $state(['r', 'g'])
</script>

<MultiSelect {items} bind:value={selected} placeholder="Pick colors" />
```

## Field mapping {#fields}

```svelte
<MultiSelect
  items={users}
  fields={{ label: 'name', value: 'id' }}
  bind:value={selectedIds}
/>
```

## Grouped options {#grouped}

```svelte
<MultiSelect
  items={[
    { label: 'Fruits', children: [
      { label: 'Apple',  value: 'a' },
      { label: 'Banana', value: 'b' }
    ]},
    { label: 'Vegetables', children: [
      { label: 'Carrot', value: 'c' },
      { label: 'Dill',   value: 'd' }
    ]}
  ]}
  bind:value
  maxDisplay={2}
/>
```

## Icons, badges, descriptions — all data (no snippet) {#defaults}

```svelte
<MultiSelect items={[
  { label: 'Frontend', icon: 'i-lucide:monitor', value: 'frontend' },
  { label: 'Backend',  icon: 'i-lucide:server',  value: 'backend',  badge: 'New' },
  { label: 'Design',   icon: '🎨',               value: 'design',   description: 'UI/UX tasks', shortcut: '⌘D' }
]} bind:value />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     badge, description, shortcut all render automatically in the dropdown.
     Selected items always appear as removable chips in the trigger. -->
```

## Custom markup for one group + one option (Tier 2) {#named}

```svelte
<script>
  const items = [
    { label: 'Stacks', snippet: 'header', children: [
      { label: 'Svelte',  value: 'svelte',  snippet: 'featured', icon: 'i-logos:svelte-icon' },
      { label: 'React',   value: 'react',   icon: 'i-logos:react' }  // stays default
    ]},
    { label: 'Languages', children: [
      { label: 'TypeScript', value: 'ts' }
    ]}                                                                // group stays default
  ]
</script>

<MultiSelect {items} bind:value>
  {#snippet header(proxy)}
    <span class="i-lucide:layers" aria-hidden="true"></span>
    <span>{proxy.label}</span>
  {/snippet}
  {#snippet featured(proxy)}
    <span class={proxy.icon} aria-hidden="true"></span>
    <span class="flex-1">{proxy.label}</span>
    <span data-item-badge>Featured</span>
  {/snippet}
</MultiSelect>
```

## Theme via class (UnoCSS arbitrary variants) {#theming}

```svelte
<MultiSelect {items} bind:value class="
  [&_[data-select-option][data-selected]]:font-semibold
  [&_[data-select-tag]]:rounded-full [&_[data-select-tag]]:bg-accent-soft
  [&_[data-item-badge]]:text-xs [&_[data-item-badge]]:text-ink-mute
  [&_[data-select-group-label]]:uppercase [&_[data-select-group-label]]:text-xs
" />
```
