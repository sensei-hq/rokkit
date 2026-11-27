## Basic — string items {#intro}

```svelte
<script>
  import { Tabs } from '@rokkit/ui'
  let active = $state('Overview')
  const items = ['Overview', 'Details', 'Settings']
</script>

<Tabs {items} bind:value={active} />
```

## Object items + field mapping {#objects}

```svelte
<script>
  import { Tabs } from '@rokkit/ui'
  const items = [
    { id: 'a', title: 'Overview', body: 'Welcome' },
    { id: 'b', title: 'Details',  body: 'Specs go here' }
  ]
  let active = $state('a')
</script>

<Tabs
  {items}
  bind:value={active}
  fields={{ label: 'title', value: 'id' }}
/>
```

## Layout — orientation + position + align {#configuration}

```svelte
<Tabs
  items={['One', 'Two', 'Three']}
  orientation="vertical"
  position="left"
  align="start"
/>
```

## Editable — add / remove {#editable}

```svelte
<script>
  import { Tabs } from '@rokkit/ui'
  let items = $state([{ label: 'Untitled' }])
  let active = $state('Untitled')
</script>

<Tabs
  bind:items
  bind:value={active}
  editable
  onadd={() => (items = [...items, { label: 'New tab' }])}
  onremove={(t) => (items = items.filter((i) => i !== t))}
/>
```

## Icons, labels, panel content — all data (no snippet) {#defaults}

```svelte
<Tabs options={[
  { value: 'overview', label: 'Overview', content: 'Welcome to the overview.' },
  { value: 'api',      label: 'API',      content: 'API docs here.',   icon: 'i-lucide:code' },
  { value: 'examples', label: 'Examples', content: 'Usage examples here.' }
]} bind:value />

<!-- icon and label render in the trigger automatically;
     content renders in the panel — no snippets needed. -->
```

## Custom trigger markup for one tab (Tier 2) {#named}

```svelte
<script>
  const options = [
    { value: 'overview', label: 'Overview', content: 'Overview panel.' },
    { value: 'live',     label: 'Live',     content: 'Live feed.',  snippet: 'live' },  // custom trigger; others default
    { value: 'settings', label: 'Settings', content: 'Settings panel.' }
  ]
</script>

<Tabs {options} bind:value>
  {#snippet live(proxy, selected)}
    <span class="i-lucide:radio" aria-hidden="true"></span>
    <span>{proxy.label}</span>
    <span class="size-2 rounded-full bg-danger"></span>
  {/snippet}
</Tabs>
```

## Theme via class (UnoCSS arbitrary variants) {#theming}

```svelte
<Tabs {options} bind:value class="
  [&_[data-tabs-trigger]]:px-4
  [&_[data-tabs-trigger][data-selected]]:font-semibold
  [&_[data-tabs-panel]]:p-6
" />
```
