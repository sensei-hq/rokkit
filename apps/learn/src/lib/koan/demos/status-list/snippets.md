## Basic — four-state checklist {#intro}

```svelte
<script>
  import { StatusList } from '@rokkit/ui'

  const items = [
    { text: 'At least 8 characters',          status: 'pass' },
    { text: 'Contains an uppercase letter',   status: 'fail' },
    { text: 'Contains a number (recommended)', status: 'warn' },
    { text: 'Special character check',        status: 'unknown' }
  ]
</script>

<StatusList {items} />
```

## Live — derived from form input {#live}

```svelte
<script>
  let password = $state('')
  const checks = $derived([
    { text: 'At least 8 characters', status: password.length >= 8 ? 'pass' : 'fail' },
    { text: 'Has uppercase',          status: /[A-Z]/.test(password) ? 'pass' : 'fail' }
  ])
</script>

<input bind:value={password} type="password" />
<StatusList items={checks} />
```
