# Checkpoint

**Slice:** qlty smells + coverage cleanup and #224 (empty /app conversation
pane) on `chore/qlty-smells-coverage`, based on develop 84d218180.

**Done:**
- #224: generic `DemoConversation` fallback; e2e on every /app demo route.
- Conversations store characterized and split; packages, chart and learn
  smells cleared (agent branches cherry-picked).
- Coverage excludes JSON/markdown/.svelte-kit/.claude; 99.09% lines.
- `qlty smells --all` reports 0; lint 0/0; `bun run check` green (9390).

**Remaining:** full e2e result → push → PR to develop → merge + CI green →
close #224 with the corrected root cause (missing bespoke branches).

**Next command:** `git push -u origin chore/qlty-smells-coverage`

**Open questions (user):**
- Suspend the Qlty GitHub App in the org settings (still posts a failing,
  non-required `qlty check` status).
- 15 demos use `meta.json`/`snippets.md`, 42 are still inline TS; migrating
  the rest is an optional mechanical follow-up.

**Known-broken:** none known; sensei MCP down, so no `/sensei:checkpoint`.
