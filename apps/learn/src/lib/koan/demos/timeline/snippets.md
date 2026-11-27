## Basic — completed + active flags {#intro}

```svelte
<script>
  import { Timeline } from '@rokkit/ui'

  const steps = [
    { label: 'Requirements', subtext: 'Gather project requirements.', completed: true },
    { label: 'Design',       subtext: 'Create wireframes.',           completed: true },
    { label: 'Development',  subtext: 'Build the features.',          active: true },
    { label: 'Testing',      subtext: 'Run QA tests.' },
    { label: 'Deployment',   subtext: 'Deploy to production.' }
  ]
</script>

<Timeline items={steps} />
```

## With content snippet {#content}

```svelte
<Timeline items={steps}>
  {#snippet content(item, i)}
    {#if item.action}
      <button onclick={item.action.onclick}>{item.action.label}</button>
    {/if}
  {/snippet}
</Timeline>
```

## Custom step icons {#icons}

```svelte
const events = [
  { label: 'Created',  subtext: '10:42 AM', icon: 'i-mdi:plus-circle' },
  { label: 'Reviewed', subtext: '11:15 AM', icon: 'i-mdi:eye' },
  { label: 'Approved', subtext: '11:30 AM', icon: 'i-mdi:check-circle', completed: true }
]
```
