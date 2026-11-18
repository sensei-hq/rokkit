# Checkpoint

**Slice:** CI workflow cleanup. PR #189 (branch
`ci/cleanup-workflows` → `develop`): composite setup action, merged
`ci.yml`, renamed cleanup/i18n workflows, ninja SHA pin.

**Done:**
- Spec at `openspec/changes/ci-workflow-cleanup/`; actionlint clean.
- Job ids `check`/`browser`/`coverage` preserved → protection
  contexts match with no settings edit.
- Journal records the change.

**Remaining:** CI green on #189 → merge → delete branch → re-GET
protection on both branches to confirm contexts still match.

**Next command:** `gh pr checks 189 --watch --interval 60`, then
`gh pr merge 189 --merge`.

**Open questions (user):** none for this slice.

**Known-broken:** none.
