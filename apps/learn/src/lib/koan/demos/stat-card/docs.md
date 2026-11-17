## One number and what it counts

StatCard shows a single figure with its label — a count of tables, a
number of cycles, a pass rate. The icon and label sit on one line at
the top; the value sits below them at the card's end, so a row of
cards reads as a column of right-aligned numbers.

## Basic example

```svelte
<div data-stat-cards>
  <StatCard label="Tables" value={198} icon="i-glyph:table" />
  <StatCard label="Views" value={56} icon="i-glyph:split-view" />
</div>
```

`data-stat-cards` is an optional wrapper that lays a row of cards
out as a wrapping grid.

## Values

A number is grouped (`1,243`). A value given as text is shown as it
is — use it for a pair (`12 · 30`) or a figure with a unit.

## Tones

`danger` / `warning` / `success` / `muted` colour the value from the
theme's role tokens. Leave `tone` off for plain ink.

## Links

`href` turns the value into a link — for a count that another page
shows in full.
