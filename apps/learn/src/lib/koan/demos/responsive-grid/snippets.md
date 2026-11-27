## Auto-fit card grid {#intro}

```svelte
<ResponsiveGrid minWidth="220px" gap="1rem">
  <div data-card>One</div>
  <div data-card>Two</div>
  <div data-card>Three</div>
  <div data-card>Four</div>
</ResponsiveGrid>
```

## Capped at three columns {#capped}

```svelte
<ResponsiveGrid minWidth="180px" gap="0.75rem" maxCols={3}>
  {#each items as item (item.id)}
    <article data-card>{item.title}</article>
  {/each}
</ResponsiveGrid>
```

## Dense gallery {#dense}

```svelte
<ResponsiveGrid minWidth="120px" gap="0.5rem">
  {#each photos as photo (photo.id)}
    <img src={photo.url} alt={photo.alt} />
  {/each}
</ResponsiveGrid>
```
