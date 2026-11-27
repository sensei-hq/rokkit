## Basic — nested rows {#intro}

```svelte
<script>
  import { TreeTable } from '@rokkit/ui'

  const data = [
    {
      region: 'EMEA',
      sales: 1840,
      children: [
        { region: 'France', sales: 540 },
        { region: 'Germany', sales: 920 }
      ]
    },
    {
      region: 'AMER',
      sales: 2640,
      children: [
        { region: 'USA', sales: 1820 },
        { region: 'Canada', sales: 820 }
      ]
    }
  ]
</script>

<TreeTable {data} />
```

## From a path-string flat list {#nest-by-path}

```svelte
<script>
  import { TreeTable } from '@rokkit/ui'
  import { nestByPath } from '@rokkit/data'

  const flat = [
    { path: 'engineering', headcount: 24 },
    { path: 'engineering/web', headcount: 11 },
    { path: 'engineering/web/frontend', headcount: 7 }
  ]
  const data = nestByPath(flat, { column: 'path' })
</script>

<TreeTable {data} />
```

## Group flat rows by columns {#nest-by-columns}

```svelte
<script>
  import { TreeTable } from '@rokkit/ui'
  import { nestByColumns } from '@rokkit/data'

  const flat = [
    { region: 'EMEA', country: 'France', revenue: 320 },
    { region: 'EMEA', country: 'Germany', revenue: 280 },
    { region: 'AMER', country: 'USA', revenue: 480 }
  ]
  const data = nestByColumns(flat, ['region', 'country'])
</script>

<TreeTable {data} />
```
