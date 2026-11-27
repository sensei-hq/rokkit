## A row of counts {#row}

```svelte
<div data-stat-cards>
  <StatCard label="Tables" value={198} icon="i-glyph:table" />
  <StatCard label="Views" value={56} icon="i-glyph:split-view" />
</div>
```

## A toned, linked value {#tone}

```svelte
<StatCard label="Cycles" value={4} tone="warning" href="/diagrams/cycles" />
```
