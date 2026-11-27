## Basic — auto-derived columns {#intro}

```svelte
<script>
  import { Table } from '@rokkit/ui'
  const rows = [
    { id: 1, name: 'Ada',    role: 'Engineer' },
    { id: 2, name: 'Linus',  role: 'Engineer' },
    { id: 3, name: 'Grace',  role: 'Admiral'  }
  ]
  let selected = $state(null)
</script>

<Table data={rows} bind:value={selected} />
```

## Custom columns + formatter {#custom-columns}

```svelte
<script>
  import { Table } from '@rokkit/ui'
  const columns = [
    { key: 'name',   label: 'Name',   width: '200px' },
    { key: 'salary', label: 'Salary', align: 'right',
      formatter: (v) => '$' + v.toLocaleString() },
    { key: 'role',   label: 'Role', sortable: false }
  ]
</script>

<Table {data} {columns} />
```

## Compose with SearchFilter {#filtering}

```svelte
<script>
  import { Table, SearchFilter } from '@rokkit/ui'
  let filtered = $state(rows)
</script>

<SearchFilter source={rows} bind:filtered />
<Table data={filtered} {columns} />
```

## Multi-row selection {#multi-select}

```svelte
<script>
  import { Table } from '@rokkit/ui'
  let picked = $state([])
</script>

<!-- ctrl/cmd-click toggles, shift-click range-selects -->
<Table {data} selectable="multi" bind:values={picked} />

<p>Selected {picked.length} row{picked.length === 1 ? '' : 's'}</p>
```
