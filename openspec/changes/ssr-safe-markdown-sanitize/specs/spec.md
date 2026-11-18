# ssr-safe-markdown-sanitize — acceptance

## Given raw HTML in markdown under SSR

- **Given** markdown containing `<img src=x onerror=alert(1)>`
  rendered on the server without jsdom
- **When** the SSR HTML is produced
- **Then** either the payload is neutralized or the docs state that
  SSR callers must pre-sanitize untrusted input (code and guide agree)

## Given trusted markdown under SSR

- **Given** guide/demo markdown with no raw HTML
- **When** rendered on the server
- **Then** output is byte-identical to today (no regression)
