## Basic — nested children {#intro}

```svelte
<script>
  import { Tree } from '@rokkit/ui'
  const items = [
    { label: 'Documents', children: [
      { label: 'Resume.pdf', value: 'doc-resume' },
      { label: 'Cover-letter.pdf', value: 'doc-cover' }
    ]},
    { label: 'Music', children: [
      { label: 'Bach', value: 'm-bach' },
      { label: 'Glass', value: 'm-glass' }
    ]}
  ]
  let selected = $state(null)
</script>

<Tree {items} bind:value={selected} />
```

## Field mapping {#mapping}

```svelte
<Tree
  items={users}
  fields={{ label: 'name', value: 'id', children: 'reports' }}
/>
```

## Custom expand/collapse icons {#icons}

```svelte
<Tree
  {items}
  icons={{ expanded: 'i-mdi:folder-open', collapsed: 'i-mdi:folder' }}
  lineStyle="dotted"
/>
```

## Icons and badges — all data (no snippet) {#defaults}

```svelte
<Tree items={[
  { label: 'src', icon: 'i-lucide:folder', children: [
    { label: 'index.ts',  value: 'index',  icon: 'i-lucide:file-code', badge: 'main' },
    { label: 'utils.ts',  value: 'utils',  icon: 'i-lucide:file-code' },
    { label: 'pinned.ts', value: 'pinned', icon: 'i-lucide:file-code', badge: '★' }
  ]},
  { label: 'README.md', value: 'readme', icon: 'i-lucide:file-text' }
]} bind:value />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     badge renders automatically on leaf nodes.
     description is NOT shown by default — use itemContent for that. -->
```

## Custom markup for one node (Tier 2) {#named}

```svelte
<script>
  const items = [
    { label: 'src', icon: 'i-lucide:folder', children: [
      { label: 'index.ts',  value: 'index',  icon: 'i-lucide:file-code' },
      { label: 'pinned.ts', value: 'pinned', icon: 'i-lucide:file-code', snippet: 'pinned' }
    ]},
    { label: 'README.md', value: 'readme', icon: 'i-lucide:file-text' } // stays default
  ]
</script>

<Tree {items} bind:value>
  {#snippet pinned(proxy)}
    <span class="i-lucide:pin"></span>
    <span>{proxy.label}</span>
  {/snippet}
</Tree>
```

## Theme via class (UnoCSS arbitrary variants) {#theming}

```svelte
<Tree {items} bind:value class="
  [&_[data-tree-node]]:px-2
  [&_[data-tree-item-content][data-active]]:bg-accent-soft
  [&_[data-item-badge]]:text-xs [&_[data-item-badge]]:text-ink-mute
" />
```
