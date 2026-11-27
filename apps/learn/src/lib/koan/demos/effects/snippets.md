## Tilt — pointer-tracking rotation {#tilt}

```svelte
<Tilt maxRotation={12} setBrightness>
  <Card>
    <h3>Hover me</h3>
    <p>The card tilts toward the cursor.</p>
  </Card>
</Tilt>
```

## Shine — specular highlight {#shine}

```svelte
<Shine color="rgb(var(--accent))">
  <Card class="glossy">
    <h3>Glossy surface</h3>
    <p>Hover for a specular highlight.</p>
  </Card>
</Shine>
```

## Reveal — staggered scroll-in {#reveal}

```svelte
<Reveal direction="up" stagger={120}>
  <Card>First card</Card>
  <Card>Second card</Card>
  <Card>Third card</Card>
</Reveal>
```

## Compose all three {#compose}

```svelte
<Reveal direction="up">
  <Tilt maxRotation={8}>
    <Shine>
      <Card>Reveals → tilts → shines</Card>
    </Shine>
  </Tilt>
</Reveal>
```
