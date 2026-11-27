## Plain, link, and interactive {#intro}

```svelte
<Card>
  <h3>Simple Card</h3>
  <p>Basic body content.</p>
</Card>

<Card href="/dashboard">
  <h3>Linked Card</h3>
  <p>Renders as an anchor.</p>
</Card>

<Card onclick={() => console.log('clicked')}>
  <h3>Interactive Card</h3>
  <p>Renders as a button.</p>
</Card>
```

## Header + footer snippets {#snippets}

```svelte
<Card>
  {#snippet header()}
    <h3>Profile</h3>
  {/snippet}

  <p>Body content goes here.</p>

  {#snippet footer()}
    <button>Edit</button>
  {/snippet}
</Card>
```

## Variant palette {#variants}

```svelte
<Card variant="primary"><h3>Primary</h3></Card>
<Card variant="secondary"><h3>Secondary</h3></Card>
<Card variant="tertiary"><h3>Tertiary</h3></Card>
```
