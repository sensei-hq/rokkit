## Basic — selectable tiles {#intro}

```svelte
<script>
  import { Grid } from '@rokkit/ui'

  const items = [
    { label: 'Dashboard', icon: 'i-glyph:home' },
    { label: 'Reports',   icon: 'i-glyph:chart' },
    { label: 'Settings',  icon: 'i-glyph:settings' }
  ]

  let selected = $state(null)
</script>

<Grid {items} bind:value={selected} />
```

## Sizing — minSize + size {#sizing}

```svelte
<Grid items={tools} minSize="80px" size="sm" />
<Grid items={tools} minSize="160px" size="lg" />
```

## Custom field mapping {#fields}

```svelte
<Grid items={data} fields={{ label: 'title', value: 'id' }} />
```

## Icons, badges, descriptions — all data (no snippet) {#defaults}

```svelte
<Grid items={[
  { label: 'Rokkit',   icon: 'i-glyph:sparkle', description: 'Component library',  value: 'rokkit' },
  { label: 'Minimal',  icon: 'i-glyph:minus',   description: 'Stripped-down style', value: 'minimal', badge: 'new' },
  { label: 'Material', icon: '🎨',              description: 'Google-inspired',     value: 'material' }
]} bind:value />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     description, badge, and shortcut all render automatically. -->
```

## Custom markup for one tile (Tier 2) {#named}

```svelte
<script>
  const items = [
    { label: 'Rokkit',   value: 'rokkit',   icon: 'i-glyph:sparkle' },
    { label: 'Featured', value: 'featured', icon: 'i-glyph:star', snippet: 'featured' },
    { label: 'Minimal',  value: 'minimal',  icon: 'i-glyph:minus' } // stays default
  ]
</script>

<Grid {items} bind:value>
  {#snippet featured(proxy)}
    <span class={proxy.icon} aria-hidden="true"></span>
    <span class="font-bold">{proxy.label}</span>
    <span class="text-xs text-accent">Editor's pick</span>
  {/snippet}
</Grid>
```

## Theme via class (UnoCSS arbitrary variants) {#theming}

```svelte
<Grid {items} bind:value class="
  [&_[data-grid-item]]:p-3
  [&_[data-grid-item][data-active]]:ring-2 [&_[data-grid-item][data-active]]:ring-accent
  [&_[data-item-badge]]:text-xs [&_[data-item-badge]]:text-ink-mute
" />
```
