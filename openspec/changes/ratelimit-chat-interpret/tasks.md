# Tasks — ratelimit-chat-interpret

- [ ] Confirm the abuse path (unthrottled burst reaches upstream)
- [ ] Implement rate limiting (Cloudflare rules and/or in-handler bucket)
- [ ] Add a spec for the throttle (burst → 429, legitimate use unaffected)
- [ ] Document the limit + 429 shape for clients
- [ ] Verify against a preview deployment, not just localhost
