## Composed ChatShell {#shell}

```svelte
<script>
  import { ChatShell } from '@rokkit/ui'
  import type { ChatMessage } from '@rokkit/ui'

  let messages = $state<ChatMessage[]>([])
  let value = $state('')

  function handleSubmit(text) {
    messages.push({ id: crypto.randomUUID(), role: 'user', text })
    // …call your backend, push the assistant reply back
  }
</script>

<ChatShell bind:value {messages} onsubmit={handleSubmit} />
```

## The message snippet seam (switch on data.kind) {#message-seam}

```svelte
<ChatShell {messages} bind:value onsubmit={handleSubmit}>
  {#snippet message(msg)}
    {#if msg.data?.kind === 'chart'}
      <!-- your app mounts @rokkit/chart here -->
      <div class="chart-card">📊 chart renders here</div>
    {:else}
      <ChatMessage message={msg} />
    {/if}
  {/snippet}
</ChatShell>
```

## Standalone primitives {#primitives}

```svelte
<script>
  import { ChatMessage, ChatComposer, ChatHistory } from '@rokkit/ui'
  let value = $state('')
</script>

<ChatMessage message={{ id: '1', role: 'user', text: 'How do I theme this?' }} />
<ChatMessage message={{ id: '2', role: 'assistant', text: 'Style cascades from data-style.' }} />

<ChatComposer bind:value onsubmit={(t) => console.log(t)} />

<ChatHistory
  conversations={[{ id: 'a', title: 'Theming questions' }]}
  activeId="a"
/>
```
