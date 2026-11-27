## Basic — images, 5 MB max, multiple {#intro}

```svelte
<script>
  import { UploadTarget } from '@rokkit/ui'
</script>

<UploadTarget
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  multiple
  onfiles={(files) => console.log(files)}
  onerror={({ reason }) => console.warn(reason)}
/>
```

## Extension list {#extensions}

```svelte
<UploadTarget accept=".pdf,.docx,.md" onfiles={handle} />
```

## Compact size {#compact}

```svelte
<UploadTarget size="sm" onfiles={handle} />
```
