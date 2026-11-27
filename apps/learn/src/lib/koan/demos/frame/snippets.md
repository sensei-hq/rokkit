## Header + body + footer {#intro}

```svelte
<Frame>
  {#snippet header()}
    <strong>Deployment</strong>
  {/snippet}

  <p>Body content sits between the header and footer zones.</p>

  {#snippet footer()}
    <button type="button">Retry</button>
  {/snippet}
</Frame>
```

## Body only {#body-only}

```svelte
<Frame>
  <p>A Frame is happy with just a body — header and footer are optional.</p>
</Frame>
```

## Flush body for a full-bleed artifact {#flush}

```svelte
<Frame flush>
  {#snippet header()}
    <strong>chart.svelte</strong>
  {/snippet}

  <pre>const total = rows.reduce(sum, 0)</pre>
</Frame>
```
