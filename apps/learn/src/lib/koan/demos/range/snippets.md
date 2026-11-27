## Single value {#intro}

```svelte
<Range bind:value min={0} max={100} />
```

## With ticks {#ticks}

```svelte
<Range bind:value min={0} max={100} step={10} ticks={11} />
```

## Range mode {#range}

```svelte
<Range range bind:lower bind:upper min={0} max={100} />
```
