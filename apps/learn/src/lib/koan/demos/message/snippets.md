## Basic {#intro}

```svelte
<Message type="success" text="Saved." />
```

## Dismissible {#dismissible}

```svelte
<Message type="info" text="Heads up." dismissible ondismiss={() => ...} />
```

## Rich content + actions {#rich}

```svelte
<Message type="warning">
  <strong>Heads up.</strong> Migration at 2 AM UTC.
  {#snippet actions()}
    <Button>Retry</Button>
  {/snippet}
</Message>
```
