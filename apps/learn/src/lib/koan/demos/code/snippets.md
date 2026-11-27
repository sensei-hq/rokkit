## Basic — JavaScript {#intro}

```svelte
<script>
  import { Code } from '@rokkit/ui'

  const example = `function greet(name) {
  return \`Hello, \${name}!\`
}`
</script>

<Code code={example} language="javascript" />
```

## Svelte with line numbers {#svelte}

```svelte
<Code code={component} language="svelte" showLineNumbers />
```

## Light theme {#light}

```svelte
<Code code={example} language="json" theme="light" />
```
