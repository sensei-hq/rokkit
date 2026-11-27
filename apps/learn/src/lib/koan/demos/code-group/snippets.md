## Basic — 3 files, App.svelte selected {#intro}

```svelte
<script>
  import { CodeGroup } from '@rokkit/ui'

  const files = [
    { path: 'src/App.svelte', language: 'svelte', code: appSrc },
    { path: 'src/lib/Button.svelte', language: 'svelte', code: buttonSrc },
    { path: 'package.json', language: 'json', code: pkgSrc }
  ]
</script>

<CodeGroup {files} initialFile="src/App.svelte" />
```

## Nested folders (tree shape) {#nested}

```svelte
<CodeGroup files={[
  { path: 'src/lib/Button.svelte', language: 'svelte', code: btn },
  { path: 'src/lib/Card.svelte',   language: 'svelte', code: card },
  { path: 'src/routes/+page.svelte', language: 'svelte', code: page },
  { path: 'src/app.css',           language: 'css',    code: css }
]} />
```
