## Basic — async folder children {#intro}

```svelte
<script>
  import { LazyTree } from '@rokkit/ui'

  const items = [
    { label: 'Documents', value: 'docs', icon: 'i-glyph:folder', children: true },
    { label: 'Pictures',  value: 'pics', icon: 'i-glyph:folder', children: true },
    { label: 'notes.txt', value: 'notes', icon: 'i-glyph:file-text' }
  ]

  async function handleLazyLoad(item) {
    await new Promise((r) => setTimeout(r, 800))
    if (item.value === 'docs') return [
      { label: 'Resume.pdf', value: 'resume', icon: 'i-glyph:file-text' }
    ]
    return []
  }
</script>

<LazyTree {items} onlazyload={handleLazyLoad} />
```

## Nested lazy — second-level fetch {#nested}

```svelte
async function handleLazyLoad(item) {
  if (item.value === 'projects') return [
    { label: 'rokkit', value: 'rokkit', icon: 'i-glyph:folder', children: true }
  ]
  if (item.value === 'rokkit') return [
    { label: 'README.md', value: 'readme', icon: 'i-glyph:file-text' }
  ]
}
```
