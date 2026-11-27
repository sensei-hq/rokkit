## Vertical stack {#intro}

```svelte
<Stack gap="sm">
  <div data-card>Item one</div>
  <div data-card>Item two</div>
  <div data-card>Item three</div>
</Stack>
```

## Horizontal stack {#horizontal}

```svelte
<Stack direction="horizontal" gap="md" align="center">
  <span class="i-mdi:home" aria-hidden="true"></span>
  <span>Home</span>
</Stack>
```

## Justify between {#alignment}

```svelte
<Stack direction="horizontal" justify="between">
  <h2>Title</h2>
  <button>Action</button>
</Stack>
```
