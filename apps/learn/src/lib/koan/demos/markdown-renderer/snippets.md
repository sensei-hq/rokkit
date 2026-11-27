## Basic prose {#intro}

```svelte
<script>
  import { MarkdownRenderer } from '@rokkit/ui'

  const content = `# Title

Body paragraph with **bold**, _italic_, and \`inline\` code.

- Bullet one
- Bullet two

\`\`\`javascript
console.log('hello')
\`\`\``
</script>

<MarkdownRenderer markdown={content} />
```

## With block plugins {#plugins}

```svelte
import { PlotPlugin, TablePlugin } from '@rokkit/blocks'

<MarkdownRenderer
  markdown={content}
  plugins={[PlotPlugin, TablePlugin]}
/>
```
