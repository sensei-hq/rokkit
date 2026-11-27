## Always-dark region {#dark}

```svelte
<LockMode mode="dark">
  <Card>Always dark surface</Card>
</LockMode>
```

## Always-light region {#light}

```svelte
<LockMode mode="light">
  <Card>Always light surface</Card>
</LockMode>
```

## Side-by-side comparison {#side-by-side}

```svelte
<div class="row">
  <LockMode mode="dark">
    <Card>Dark region</Card>
  </LockMode>
  <LockMode mode="light">
    <Card>Light region</Card>
  </LockMode>
</div>
```
