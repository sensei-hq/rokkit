# ratelimit-chat-interpret

Add abuse control to the public chat-interpret proxy endpoint.

Scan finding: security F3 (MEDIUM, static-only, unconfirmed).
Severity: Medium (availability / account-quota abuse, no data at risk).

## Why

`POST apps/learn/src/routes/api/chat/interpret` is unauthenticated
with no rate limiting. It proxies to OpenRouter with the account key,
so anyone can burn the account's quota/rate-limit into 429s or a
flagged key. No key leak (key is server-only; errors are scrubbed to
one line / 200 chars) — the exposure is purely availability + cost.

## What

- Confirm the abuse path (repeated POSTs from one client reach the
  upstream unthrottled)
- Add proportional abuse control: per-IP/per-session rate limiting
  suitable for a demo endpoint (Cloudflare rate-limiting rules and/or
  in-handler token bucket — pick the smallest that holds)
- Keep the no-key 503 and error-scrubbing behavior unchanged
- Document the limit and its failure mode (429 shape) for clients

Out of scope: authentication (demo has no users), F1/F2 sinks.

## Evidence

- `apps/learn/src/routes/api/chat/interpret/+server.ts` (handler shape
  re-verified by parent: bounded body, fixed upstream URL, 20s timeout,
  no throttle)
- `interpret-request.ts` (allowlist + bounds already in place)
- Verify: burst POSTs from one client before/after the fix

## Impact

- Quota/availability protected; legitimate demo traffic unaffected

## Risks

- **Over-throttling**: a too-tight limit breaks the demo under shared
  NAT — set the limit from observed demo traffic with headroom.
