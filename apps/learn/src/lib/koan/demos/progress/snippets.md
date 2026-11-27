## Determinate at common percentages {#intro}

```svelte
<script>
  import { ProgressBar } from '@rokkit/ui'
</script>

<ProgressBar value={25} />
<ProgressBar value={50} />
<ProgressBar value={75} />
```

## Custom max {#custom-max}

```svelte
<ProgressBar value={1024} max={2048} />
```

## Indeterminate {#indeterminate}

```svelte
<ProgressBar value={null} />
```
