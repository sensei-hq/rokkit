# Checkpoint

**Slice:** Deep review + openspec migration (deep-review workflow).
Committed on `develop` as 8c18cb194 (migration) + 1acfb4385
(16 follow-up changes). This checkpoint rides in the docs commit.

**Done:**
- Security review: 7 findings (3 MEDIUM static-only) + OWASP map +
  verified-good list; F1/F2 sinks + F3 handler re-read by parent.
- Duplication: jscpd 2.57%, 7 candidates; dead code: 24 items triaged.
- 13 child + 3 parent (F1–F3) follow-up openspec changes, specs-only.
- Plans/specs folders migrated to `openspec/changes/archive/`
  (byte-identical); pipeline now openspec in workflow/CLAUDE/commands.
- develop CI green on the Kit 3 push (Check + Coverage success).

**Remaining:** commit this batch; D13/D20/D23 + icons/scripts
maintainer decisions; F1–F3 PoC confirmations; required-reviews +
develop-mirror protection decisions (asked earlier, still open).

**Next command:** none until user authorizes commit+push.

**Open questions (user):**
- Commit + push this docs batch?
- D13: export test-only modules or delete? D20/D23 dedicated specs?
- (Still open) required reviews on `main`, mirror rule to `develop`?

**Known-broken:** none.
