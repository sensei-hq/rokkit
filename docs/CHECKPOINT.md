# Checkpoint

**Slice:** learn site mobile/tablet layouts — branch `fix/mobile-layout`
(red 41615d5a8, ba2edd5d0, 230d7c7b2 → green 050bb38a1).

**Done:**
- Header, guides, /app, /chat, home responsive at 360/390/768px.
- `e2e/mobile-layout.e2e.ts` (27 tests) green; 134-route audit clean at
  360/390/768/1440; `bun run check` green.

**Remaining:** user review; push + PR to develop.

**Next command:** `git push -u origin fix/mobile-layout && gh pr create --base develop`

- Stale guides dark-rail e2e updated to the deliberate ink-mute design; full
  e2e 232/232.

**Open questions (user):** none.

**Known-broken:** none.
