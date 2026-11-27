## Plain horizontal {#plain}

```svelte
<Divider />
```

## With label {#labelled}

```svelte
<Divider label="OR" />
```

## Vertical (inside a flex row) {#vertical}

```svelte
<div style="display: flex; gap: 12px; height: 32px;">
  <span>Left</span>
  <Divider orientation="vertical" />
  <span>Right</span>
</div>
```
