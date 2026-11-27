## Trigger a toast — imperative API {#intro}

```svelte
<script>
  import { alerts } from '@rokkit/states'
  import { Button, AlertList } from '@rokkit/ui'
</script>

<Button onclick={() => alerts.success('Saved successfully')}>
  Save
</Button>

<AlertList position="top-right" />
```

## All four kinds {#kinds}

```svelte
<Button onclick={() => alerts.info('FYI…')}>Info</Button>
<Button onclick={() => alerts.success('Saved')}>Success</Button>
<Button onclick={() => alerts.warning('Heads up')}>Warning</Button>
<Button onclick={() => alerts.error('Something broke')}>Error</Button>
```

## Position + auto-dismiss {#options}

```svelte
<AlertList
  position="bottom-right"
  duration={3000}
  max={3}
/>
```
