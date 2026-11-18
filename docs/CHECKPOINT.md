# Checkpoint

**Slice:** InputCheckbox a11y fix (#190). PR #191 (branch
`fix/input-checkbox-a11y` → `develop`): native input is the control,
decorative forwarding icon, theme CSS updates, 5 new specs.

**Done:**
- Spec at `openspec/changes/input-checkbox-a11y/`; TDD red → green.
- Gates green locally: forms 813, lint 0, svelte-check 0/0,
  full suite 9137, themes build with new rules in dist.
- Journal records the fix + harness findings.

**Remaining:** CI green on #191 → merge (needs owner approval) →
close #190 → note sensei#389 workaround removal.

**Next command:** `gh pr checks 191 --watch --interval 60`, then ask
owner to merge.

**Open questions (user):**
- Merge #191 once green?

**Known-broken:** none.
