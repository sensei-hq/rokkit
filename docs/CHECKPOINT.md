# Checkpoint

**Slice:** learn site mobile/tablet layouts — branch `fix/mobile-layout`
(red 41615d5a8, ba2edd5d0, 230d7c7b2 → green 050bb38a1).

**Done:**
- Header, guides, /app, /chat, home responsive at 360/390/768px.
- `e2e/mobile-layout.e2e.ts` (27 tests) green; 134-route audit clean at
  360/390/768/1440; `bun run check` green.

**Remaining:** user review; push + PR to develop.

**Next command:** `git push -u origin fix/mobile-layout && gh pr create --base develop`

**Open questions (user):**
- Fix the pre-existing zen-sumi dark rail colour (test expects `--ink`, renders
  ~ink-soft) in the theme, or update the test's expectation?

**Known-broken:** `guides.e2e.ts` "rail takes zen-sumi's List look in dark" —
fails on develop too, unrelated to this slice.
