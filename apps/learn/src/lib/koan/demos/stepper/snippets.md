## Basic — 3-step wizard {#intro}

```svelte
<script>
  import { Stepper, Button } from '@rokkit/ui'
  let active = $state(0)
  const steps = [
    { text: 'Account',  completed: true },
    { text: 'Profile',  completed: false },
    { text: 'Confirm',  completed: false }
  ]
</script>

<Stepper {steps} bind:current={active} />
<Button onclick={() => active++}>Next</Button>
```

## Vertical orientation {#vertical}

```svelte
<Stepper
  {steps}
  bind:current={active}
  orientation="vertical"
/>
```

## Linear (forward-only) {#linear}

```svelte
<Stepper
  {steps}
  bind:current={active}
  linear
  onclick={(i) => active = i}
/>
```
