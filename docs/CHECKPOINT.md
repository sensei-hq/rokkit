# Checkpoint

**Slice:** every Koan demo card in `meta.json`, checked against
`demo-card.schema.json` — branch `chore/demo-meta-files` off develop e4a1faada.

**Done:**
- 57/57 demos: `meta.json` (+ `$schema`) / `snippets.md` / `defineDemo` meta.ts.
- Schema spec (ajv) validates every card; demo-meta snapshot unchanged.
- Gates: `bun run check` 9515, e2e 291, lint 0/0, `qlty smells --all` 0.

**Remaining:** none — merged to develop (PR #226, 35fa40fb4).

**Next command:** none — awaiting user direction.

**Open questions (user):**
- None. Qlty GitHub App removed (2026-11-28); CI upload stays gated off
  by the unset `QLTY_ENABLED` repo variable.

**Known-broken:** none; sensei MCP down, so no `/sensei:checkpoint`.
