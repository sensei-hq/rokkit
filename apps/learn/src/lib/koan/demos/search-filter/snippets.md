## Basic — bound filters {#intro}

```svelte
<script>
  import { SearchFilter } from '@rokkit/ui'
  let filters = $state([])
</script>

<SearchFilter bind:filters placeholder="Search products..." />
```

## With onfilter callback {#callback}

```svelte
<SearchFilter
  bind:filters
  onfilter={(list) => console.log(list.length, 'filters')}
  debounce={150}
/>
```
