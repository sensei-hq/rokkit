## Basic — with icons + href {#intro}

```svelte
<script>
  import { BreadCrumbs } from '@rokkit/ui'

  const trail = [
    { label: 'Home', href: '/', icon: 'i-glyph:home' },
    { label: 'Products', href: '/products', icon: 'i-glyph:box' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptops' }
  ]
</script>

<BreadCrumbs items={trail} onclick={(v, item) => console.log(item)} />
```

## Custom separator {#separator}

```svelte
<BreadCrumbs
  items={trail}
  icons={{ separator: 'i-mdi:slash-forward' }}
/>
```

## Custom field mapping {#fields}

```svelte
<BreadCrumbs
  items={data}
  fields={{ label: 'title', href: 'path' }}
/>
```
