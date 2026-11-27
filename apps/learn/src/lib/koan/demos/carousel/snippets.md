## Basic — snippet slide {#intro}

```svelte
<script>
  import { Carousel } from '@rokkit/ui'

  let current = $state(0)
  const slides = [
    { title: 'Welcome',     icon: 'i-glyph:star' },
    { title: 'Features',    icon: 'i-glyph:bolt' },
    { title: 'Get Started', icon: 'i-glyph:rocket' }
  ]
</script>

<Carousel count={slides.length} bind:current>
  {#snippet slide(index)}
    <div class="slide">
      <span class={slides[index].icon}></span>
      <h3>{slides[index].title}</h3>
    </div>
  {/snippet}
</Carousel>
```

## Autoplay — fade transition {#autoplay}

```svelte
<Carousel count={3} autoplay interval={3000} transition="fade">
  ...slides...
</Carousel>
```

## Bounded — no loop, no autoplay {#noloop}

```svelte
<Carousel count={3} loop={false} autoplay={false}>
  ...slides...
</Carousel>
```
