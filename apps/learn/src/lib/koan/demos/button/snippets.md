## Basic — label + click {#intro}

```svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<Button onclick={() => console.log('clicked')}>Save</Button>
```

## With icons {#icons}

```svelte
<Button icon="i-mdi:download">Download</Button>
<Button icon="i-mdi:heart" aria-label="Like" />
<Button label="Next" iconRight="i-mdi:arrow-right" />
```

## States — disabled, loading {#states}

```svelte
<Button disabled>Disabled</Button>
<Button loading>Saving...</Button>
```

## Link mode {#link}

```svelte
<Button href="/dashboard">Dashboard</Button>
<Button href="https://github.com/..." target="_blank">Repo</Button>
```
