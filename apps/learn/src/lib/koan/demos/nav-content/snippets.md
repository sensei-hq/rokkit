## Sidebar + content {#intro}

```svelte
<NavContent navSize="240px">
  {#snippet nav()}
    <nav>
      <a href="#overview">Overview</a>
      <a href="#billing">Billing</a>
    </nav>
  {/snippet}

  {#snippet content()}
    <article>Selected page renders here.</article>
  {/snippet}
</NavContent>
```

## Vertical — nav on top {#vertical}

```svelte
<NavContent orientation="vertical" navSize="56px">
  {#snippet nav()}
    <div class="tabs">Tabs / toolbar row</div>
  {/snippet}

  {#snippet content()}
    <section>Panel body</section>
  {/snippet}
</NavContent>
```

## Non-collapsible rail {#fixed}

```svelte
<NavContent navSize="220px" collapsible={false}>
  {#snippet nav()}
    <nav>Always-visible rail</nav>
  {/snippet}

  {#snippet content()}
    <article>Content</article>
  {/snippet}
</NavContent>
```
