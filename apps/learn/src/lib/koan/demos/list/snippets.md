## Basic — array of objects {#intro}

```svelte
<script>
  import { List } from '@rokkit/ui'
  const items = [
    { label: 'Inbox',    icon: 'i-mdi:inbox', value: 'inbox' },
    { label: 'Starred',  icon: 'i-mdi:star',  value: 'starred' },
    { label: 'Archive',  icon: 'i-mdi:archive', value: 'archive' }
  ]
  let active = $state('inbox')
</script>

<List {items} bind:value={active} />
```

## Nested groups + collapsible {#nested}

```svelte
<List
  items={[
    { label: 'Mail', children: [
      { label: 'Inbox',    value: 'inbox' },
      { label: 'Drafts',   value: 'drafts' }
    ]},
    { label: 'Settings', children: [
      { label: 'Profile',  value: 'profile' },
      { label: 'Security', value: 'security' }
    ]}
  ]}
  collapsible
/>
```

## Field mapping {#mapping}

```svelte
<List
  items={routes}
  fields={{ label: 'name', value: 'path', icon: 'symbol' }}
/>
```

## Icons, badges, descriptions — all data (no snippet) {#defaults}

```svelte
<List items={[
  { label: 'Inbox',   icon: 'i-lucide:inbox', badge: '12' },
  { label: 'Starred', icon: '⭐', description: 'Flagged messages' },
  { label: 'Drafts',  icon: 'i-lucide:file', shortcut: '⌘D' }
]} bind:value />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     badge, description, shortcut all render automatically. -->
```

## Custom markup for one group + one item (Tier 2) {#named}

```svelte
<script>
  const items = [
    { label: 'Observatory', snippet: 'header', children: [{ label: 'Telescopes' }] },
    { label: 'Settings', children: [{ label: 'General' }] }, // stays default
    { label: 'Pinned', snippet: 'pinned' }                   // custom leaf
  ]
</script>

<List {items} collapsible={false}>
  {#snippet header(proxy)}
    <span data-item-label>{proxy.label}</span>
    <span class="flex-1"></span>
    <!-- Any [role="button"] / [role="switch"] descendant is deferred to
         by Navigator (see the Config-style row example). Nested native
         <button> won't survive SSR — the HTML parser hoists it out. -->
  {/snippet}
  {#snippet pinned(proxy)}
    <span class="i-lucide:pin"></span>
    <span>{proxy.label}</span>
  {/snippet}
</List>
```

## Config-style rows — ItemSwitch / ItemToggle {#settings}

```svelte
<script>
  import { List, ItemSwitch, ItemToggle } from '@rokkit/ui'

  const settings = $state([
    { label: 'Notifications', description: 'Alerts & sounds', checked: true },
    { label: 'Dark mode',     description: 'Theme',            checked: false },
    { label: 'Density',       value: 'md', options: ['sm', 'md', 'lg'] }
  ])
</script>

<List items={settings} onselect={(_, proxy) => {
  if ('checked' in proxy.value) proxy.value.checked = !proxy.value.checked
}}>
  {#snippet itemContent(proxy)}
    {#if proxy.get('options')}
      <ItemToggle {proxy} onchange={(v) => (proxy.value.value = v)} />
    {:else}
      <ItemSwitch {proxy} />
    {/if}
  {/snippet}
</List>
```

## Theme via class (UnoCSS arbitrary variants) {#theming}

```svelte
<List {items} collapsible class="
  [&_[data-list-group]]:px-4
  [&_[data-list-item]]:py-1
  [&_[data-item-badge]]:text-xs [&_[data-item-badge]]:text-ink-mute
" />
```
