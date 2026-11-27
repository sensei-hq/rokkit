## Basic — default mapping, auto-apply {#intro}

```svelte
<script>
  import { PaletteManager } from '@rokkit/ui'
  let palette = $state(null) // initialised to defaultPaletteConfig
</script>

<PaletteManager bind:value={palette} autoApply />
```

## Persisted with storageKey {#persisted}

```svelte
<PaletteManager
  bind:value={palette}
  bind:custom={savedPalettes}
  storageKey="my-app:palette"
/>
```

## Compact for sidebar {#compact}

```svelte
<PaletteManager bind:value={palette} compact />
```
