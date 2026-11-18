# Checkpoint

**Slice:** Kit 3 toolchain migration + branch protection + dependabot
diagnosis (ultracode workflow). Migration DONE uncommitted on `develop`;
protection LIVE on `main`; dependabot diagnosed (Settings toggle, no file).

**Done:**
- `openspec/changes/{kit3-toolchain-migration,main-branch-protection,
  dependabot-routing}/{proposal.md,tasks.md,specs/spec.md}` — 9 files.
- Kit 3 migration (135 files, uncommitted): kit ^3.3.1, adapters 8.x,
  vite ^8.3.8, plugin-svelte ^7.3.1, svelte ^5.57.3, TS ^6.0.3.
- All 5 gates independently re-run, real exit 0: frozen install (764),
  lint, svelte-check 0/0, CF build (`_worker.js` 8500B), test:ci
  (605 files / 9134 passed, 1 skipped). bun 1.4.4 pins intact.
- `main` protection: strict required checks [check, browser].
- PR #175 root cause: Dependabot SECURITY updates toggle → `main`;
  no config file exists or ever did.

**Remaining:** commit+push migration; harden `main` (user decision);
mirror protection to `develop` (user decision); optional
version-updates `dependabot.yml`; Cloudflare preview check.

**Next command:** none until user authorizes commit+push.

**Open questions (user):**
- Commit + push the 135-file migration?
- Enable `enforce_admins` + required reviews on `main`, mirror to `develop`?

**Known-broken:** none. (`main` still on Kit 2 with reopened alerts 2-5
until the migration merges.)
