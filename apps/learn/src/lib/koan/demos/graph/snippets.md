## Minimal {#minimal}

```svelte
<script>
  import { Graph } from '@rokkit/graph'

  const nodes = [
    { id: 'users', label: 'users', rows: [{ name: 'id' }] },
    { id: 'orders', label: 'orders', rows: [{ name: 'user_id' }] }
  ]
  const edges = [{ source: 'orders', target: 'users' }]
</script>

<Graph {nodes} {edges} />
```

## Any shape, via fields {#fields}

```svelte
<script>
  import { Graph } from '@rokkit/graph'

  // Nothing here matches the canonical model. The map is the whole adapter.
  const services = [{ key: 'checkout', team: 'commerce', endpoints: [{ label: 'POST /cart' }] }]
  const calls = [{ caller: 'checkout', callee: 'catalog' }]

  const fields = {
    id: 'key', label: 'key', group: 'team',
    rows: 'endpoints', rowName: 'label',
    source: 'caller', target: 'callee'
  }
</script>

<Graph nodes={services} edges={calls} {fields} />
```

## dbd schema JSON {#schema}

```svelte
<script>
  import { Graph } from '@rokkit/graph'
  import { SCHEMA_FIELDS, fromSchemaModel } from '@rokkit/graph/schema'

  // Either hand SCHEMA_FIELDS straight to Graph...
  // ...or normalise once and share the model.
  const model = fromSchemaModel(schemaJson)
</script>

<Graph nodes={schemaJson.tables} edges={schemaJson.refs} fields={SCHEMA_FIELDS} />
```

## Preset override {#preset}

```svelte
<script>
  import { Graph, createGraphPreset } from '@rokkit/graph'

  const preset = createGraphPreset({
    groups: ['teal', 'gold', 'violet'],   // the ramp, in assignment order
    shades: { dark: { fill: '800' } },     // partial, merges
    using: 'pattern'                       // colour-blind- and print-safe
  })
</script>

<Graph {nodes} {edges} {preset} />
```

## One-rule CSS override {#css-override}

```css
/* Every visual hook is a data-attribute, so one rule retones a kind — no prop,
   no preset, no component change.

   Match the theme's specificity. Each style scopes its rules under [data-style], so a
   bare [data-node-kind='table'] is (0,1,1) against the theme's (0,2,0) and loses. */
[data-style] [data-node-kind='table'] {
  --node-accent: var(--primary);
}

/* Or target one style, which is what you want when the tone is style-specific: */
[data-style='zen-sumi'] [data-node-kind='view'] {
  --node-accent: var(--accent);
}
```
