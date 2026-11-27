## Basic — formatting toolbar {#intro}

```svelte
<script>
  import { Toolbar } from '@rokkit/ui'

  const items = [
    { label: 'Bold', icon: 'i-glyph:text-bold' },
    { label: 'Italic', icon: 'i-glyph:text-italic' },
    { label: 'Underline', icon: 'i-glyph:text-underline' },
    { itemType: 'separator' },
    { label: 'Align Left', icon: 'i-glyph:align-left' },
    { label: 'Align Center', icon: 'i-glyph:align-center' },
    { label: 'Align Right', icon: 'i-glyph:align-right' }
  ]
</script>

<Toolbar {items} onclick={(item) => console.log(item.label)} />
```

## Separators + spacer {#spacer}

```svelte
<Toolbar
  items={[
    { label: 'New', icon: 'i-glyph:add-circle' },
    { label: 'Open', icon: 'i-glyph:folder-open' },
    { itemType: 'separator' },
    { label: 'Save', icon: 'i-glyph:diskette' },
    { itemType: 'spacer' },
    { label: 'Settings', icon: 'i-glyph:settings' }
  ]}
/>
```

## Vertical orientation {#vertical}

```svelte
<Toolbar items={tools} position="left" compact />
```
