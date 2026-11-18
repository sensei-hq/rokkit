# Tasks — fix-tooltip-xss-sink

- [ ] Reproduce the PoC in a real browser (untrusted `x` value, tooltip on, hover) and record fired/not-fired
- [ ] Escape keys/values in `formatDefault` (or switch row rendering to DOM)
- [ ] Add a browser-mode regression spec over the PoC shape + an entity-input case
- [ ] Run chart specs, lint, and svelte-check for the chart package
