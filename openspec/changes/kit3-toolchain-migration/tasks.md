# Tasks: kit3-toolchain-migration

- [ ] 1. Record current toolchain versions (kit, vite, plugin-svelte, svelte,
  typescript, adapters) from `apps/learn`, `packages/unocss`, and root
  `package.json`
- [ ] 2. Resolve exact target versions: kit `3.x` plus kit-3-compatible
  adapter-auto / adapter-cloudflare majors satisfying the kit 3.2.0 peer
  matrix (vite `^8.0.12`, plugin-svelte `^7.0.0`, svelte `^5.57.1`,
  typescript `^6.0.0`)
- [ ] 3. Bump `apps/learn/package.json` (kit, vite, plugin-svelte, svelte,
  adapters) and `packages/unocss/package.json` (peer + dev kit range)
- [ ] 4. Align root `package.json` peers/`overrides` (svelte, vite,
  plugin-svelte, typescript) with the new toolchain
- [ ] 5. Regenerate `bun.lock` with pinned bun `1.4.4` and review the diff for
  unexpected downgrades
- [ ] 6. Apply kit 3 / vite 8 / TS 6 migration edits (adapter config,
  `svelte.config.js`, removed APIs)
- [ ] 7. Gate: `bun install --frozen-lockfile` passes from a clean tree
- [ ] 8. Gate: `bun run lint` passes with 0 errors and 0 warnings
- [ ] 9. Gate: `bun run check:types` and `bun run check:svelte` pass
- [ ] 10. Gate: `bun run build` in `apps/learn` (Cloudflare adapter) passes
- [ ] 11. Gate: full `bun run test:ci` passes
- [ ] 12. Update affected docs (`agents/journal.md`, design docs) and open the
  PR against `develop`
