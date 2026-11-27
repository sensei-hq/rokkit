## Basic — top, default delay {#intro}

```svelte
<script>
  import { Tooltip, Button } from '@rokkit/ui'
</script>

<Tooltip content="Saves your changes" position="top">
  <Button>Save</Button>
</Tooltip>
```

## Four sides — auto-flips near edges {#positions}

```svelte
<Tooltip content="Top" position="top"><Button>Top</Button></Tooltip>
<Tooltip content="Right" position="right"><Button>Right</Button></Tooltip>
<Tooltip content="Bottom" position="bottom"><Button>Bottom</Button></Tooltip>
<Tooltip content="Left" position="left"><Button>Left</Button></Tooltip>
```

## Rich content snippet {#rich}

```svelte
<Tooltip position="bottom">
  <Button>Status</Button>
  {#snippet tooltipContent()}
    <div>
      <strong>Build</strong> passing
      <br /><strong>Deploy</strong> queued
    </div>
  {/snippet}
</Tooltip>
```
