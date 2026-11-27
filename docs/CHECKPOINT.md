# Checkpoint

**Slice:** every Koan demo card in `meta.json`, checked against
`demo-card.schema.json` — branch `chore/demo-meta-files` off develop e4a1faada.

**Done:**
- 57/57 demos: `meta.json` (+ `$schema`) / `snippets.md` / `defineDemo` meta.ts.
- Schema spec (ajv) validates every card; demo-meta snapshot unchanged.
- Gates: `bun run check` 9515, e2e 291, lint 0/0, `qlty smells --all` 0.

**Remaining:** push → PR to develop → CI green → merge.

**Next command:** `git push -u origin chore/demo-meta-files`

**Open questions (user):**
- Suspend the Qlty GitHub App in org settings (non-required failing status).

**Known-broken:** none; sensei MCP down, so no `/sensei:checkpoint`.
