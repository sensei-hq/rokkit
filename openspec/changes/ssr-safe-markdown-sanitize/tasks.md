# Tasks — ssr-safe-markdown-sanitize

- [ ] Reproduce the bypass (SSR render of raw-HTML markdown without jsdom) and record pass-through or not
- [ ] Decide: real SSR sanitizing vs documented pre-sanitize contract (owner call if it changes the API)
- [ ] Implement the decision + align `markdown-renderer/docs.md` with the code
- [ ] Add an SSR regression spec over raw-HTML markdown input
- [ ] Run ui specs, lint, and svelte-check for the ui package
