# fix-tooltip-xss-sink

Escape untrusted data in the chart tooltip's default HTML rendering.

Scan finding: security F1 (MEDIUM, static-only, unconfirmed).
Severity: Medium (stored-XSS sink; default-off mitigates in-app).

## Why

`formatDefault` in `packages/chart/src/Plot/Tooltip.svelte:30-38`
interpolates raw data keys and values into an HTML string rendered via
`{@html content}` (`Tooltip.svelte:54`). Any consumer that enables
`tooltip` over untrusted rows gets script execution on hover.

Mitigating today: `Plot.svelte:84` and `BarChart.svelte:57` default
`tooltip` to false, and no in-app surface enables it — so this is a
latent library-level sink, not a live exploit.

## What

- Confirm the PoC first: render a `BarChart` with
  `data=[{x:'<img src=x onerror=alert(1)>',y:1}]`, `tooltip` on, hover
  the bar in a real browser; record whether the handler fires
- If confirmed: escape keys/values in `formatDefault` (or render rows
  as DOM instead of an HTML string); keep the custom-`tooltip`
  function path unchanged (consumer-owned HTML stays consumer-owned)
- Add a browser-mode regression spec over the PoC shape

Out of scope: F2 (MarkdownRenderer), F4 (buildInitScript) — separate changes.

## Evidence

- `packages/chart/src/Plot/Tooltip.svelte::formatDefault` L30-38 +
  `{@html content}` L54 (sink re-verified by parent)
- `packages/chart/src/Plot.svelte:84`, `BarChart.svelte:57`
  (`tooltip=false` defaults)
- Verify: the PoC above in Chromium via the chart demo

## Impact

- Untrusted chart data becomes safe to tooltip; no API change

## Risks

- **Over-escaping**: escaping could alter rendering for consumers that
  pass pre-escaped entities — mitigate with a spec over entity input.
