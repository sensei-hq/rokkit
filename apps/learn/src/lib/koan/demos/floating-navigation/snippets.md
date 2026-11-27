## Basic — right-anchored, observed {#intro}

```svelte
<script>
  import { FloatingNavigation } from '@rokkit/ui'

  const items = [
    { label: 'Introduction', value: 'intro',    icon: 'i-glyph:book',   href: '#intro' },
    { label: 'Features',     value: 'features', icon: 'i-glyph:star',   href: '#features' },
    { label: 'Contact',      value: 'contact',  icon: 'i-glyph:letter', href: '#contact' }
  ]
</script>

<FloatingNavigation {items} value="intro" position="right" />
```

## Pinned open {#pinned}

```svelte
<FloatingNavigation {items} position="left" bind:pinned />
```

## Manual value control {#unobserved}

```svelte
<FloatingNavigation {items} bind:value observe={false} />
```
