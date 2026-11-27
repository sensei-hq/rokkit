## Basic — vertical expand {#intro}

```svelte
<script>
  import { FloatingAction } from '@rokkit/ui'

  const actions = [
    { label: 'Edit', value: 'edit', icon: 'i-glyph:edit' },
    { label: 'Copy', value: 'copy', icon: 'i-glyph:copy' },
    { label: 'Share', value: 'share', icon: 'i-glyph:share' }
  ]
</script>

<FloatingAction
  items={actions}
  icon="i-glyph:add-circle"
  onselect={(v) => console.log(v)}
/>
```

## Radial expand {#radial}

```svelte
<FloatingAction items={actions} expand="radial" position="bottom-right" />
```

## Card-scoped (contained) {#contained}

```svelte
<div class="card relative">
  <FloatingAction items={actions} contained position="bottom-right" />
</div>
```
