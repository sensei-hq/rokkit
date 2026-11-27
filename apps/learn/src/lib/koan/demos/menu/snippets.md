## Basic — icons + onselect {#intro}

```svelte
<script>
  import { Menu } from '@rokkit/ui'

  const actions = [
    { label: 'Copy', icon: 'i-glyph:copy' },
    { label: 'Cut', icon: 'i-glyph:scissors' },
    { label: 'Paste', icon: 'i-glyph:clipboard' },
    { label: 'Delete', icon: 'i-glyph:trash-bin' }
  ]
</script>

<Menu items={actions} label="Actions" onselect={(v) => console.log(v)} />
```

## Grouped items {#groups}

```svelte
<Menu
  label="Menu"
  items={[
    { label: 'File', children: [
      { label: 'New', icon: 'i-glyph:add-circle' },
      { label: 'Open', icon: 'i-glyph:folder-open' }
    ] },
    { label: 'Edit', children: [
      { label: 'Undo', icon: 'i-glyph:restart' },
      { label: 'Copy', icon: 'i-glyph:copy' }
    ] }
  ]}
/>
```

## End-aligned, up direction {#alignment}

```svelte
<Menu items={actions} label="More" align="end" direction="up" />
```

## Icons, badges, descriptions, shortcuts — all data (no snippet) {#defaults}

```svelte
<Menu label="Actions" onselect={(v) => console.log(v)} items={[
  { label: 'Copy',    icon: 'i-lucide:copy',     value: 'copy',    shortcut: '⌘C' },
  { label: 'Cut',     icon: 'i-lucide:scissors',  value: 'cut',     shortcut: '⌘X' },
  { type: 'separator' },
  { label: 'Paste',   icon: 'i-lucide:clipboard', value: 'paste',   shortcut: '⌘V' },
  { label: 'Delete',  icon: '🗑',                  value: 'delete',  description: 'Cannot be undone', badge: '!' }
]} />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     badge, description, shortcut all render automatically.
     { type: 'separator' } inserts an <hr data-menu-separator />. -->
```

## Custom markup for one group + one item (Tier 2) {#named}

```svelte
<script>
  const items = [
    { label: 'Danger Zone', snippet: 'danger-group', children: [
      { label: 'Delete', value: 'delete', snippet: 'danger', icon: 'i-lucide:trash' },
      { label: 'Archive', value: 'archive' }   // stays default
    ]},
    { label: 'Edit', children: [
      { label: 'Rename', value: 'rename' }
    ]}                                          // group stays default
  ]
</script>

<Menu {items} label="File" {onselect}>
  {#snippet danger(proxy)}
    <span class={proxy.icon ?? 'i-lucide:trash'} aria-hidden="true"></span>
    <span class="text-danger">{proxy.label}</span>
  {/snippet}
  {#snippet danger-group(proxy)}
    <span class="i-lucide:alert-triangle text-danger" aria-hidden="true"></span>
    <span data-menu-group-text class="text-danger">{proxy.label}</span>
  {/snippet}
</Menu>
```

## Theme via class (UnoCSS arbitrary variants) {#theming}

```svelte
<Menu {items} label="Actions" {onselect} class="
  [&_[data-menu-item]]:py-1.5
  [&_[data-menu-item][data-active]]:font-semibold
  [&_[data-item-shortcut]]:text-xs [&_[data-item-shortcut]]:text-ink-mute
  [&_[data-menu-separator]]:my-1
" />
```
