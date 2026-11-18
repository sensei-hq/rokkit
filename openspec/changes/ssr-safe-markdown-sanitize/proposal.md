# ssr-safe-markdown-sanitize

Close the SSR sanitizer bypass in MarkdownRenderer (or correct the docs).

Scan finding: security F2 (MEDIUM, static-only, unconfirmed).
Severity: Medium (XSS for SSR consumers of untrusted markdown).

## Why

`packages/ui/src/MarkdownRenderer.svelte:32-35` falls back to the
identity function `(raw) => raw` when `DOMPurify.sanitize` is
unavailable (SSR without jsdom), while `marked` passes raw HTML
through. SSR output can therefore carry `<img onerror>` or
`javascript:` links — contradicting `markdown-renderer/docs.md:3-4`,
which claims unconditional DOMPurify sanitizing.

Mitigating today: in-app SSR markdown is trusted (guides, demos) and
chat markdown is client-state only — latent in-app, real for SSR
consumers of untrusted input.

## What

- Confirm: SSR-render markdown containing raw HTML without jsdom and
  record whether the HTML passes through
- Either make SSR sanitize for real (e.g. optional jsdom-backed path,
  link/HTML policy) or narrow the docs claim and require callers to
  pre-sanitize (the code comment already says this; the guide does not)
- Add an SSR regression spec over raw-HTML markdown input

Out of scope: F1 (tooltip), client-side sanitizing (already real).

## Evidence

- `packages/ui/src/MarkdownRenderer.svelte:25-43` (fallback re-verified
  by parent; comment documents it, guide contradicts it)
- `markdown-renderer/docs.md:3-4` (unconditional claim)
- Verify: SSR render of `# t\n<img src=x onerror=alert(1)>` without jsdom

## Impact

- SSR consumers get the safety the docs promise, or docs that tell the truth

## Risks

- **jsdom weight**: a server sanitizer must not bloat every consumer's
  build — keep it optional/lazy if added.
