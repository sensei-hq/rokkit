# kit3-toolchain-migration

Migrate `@sveltejs/kit` 2.70.3 to 3.x plus its coordinated peers in
`apps/learn` and `packages/unocss`.

## Why

SvelteKit 3 is a coordinated toolchain major: kit cannot move alone because its
peer floor forces vite 8, `@sveltejs/vite-plugin-svelte` 7, `svelte >= 5.57.1`,
and TypeScript 6 at the same time. The repo currently sits on the kit 2 line:

- `apps/learn`: kit `^2.70.3`, vite `^7.3.5`, vite-plugin-svelte `^6.2.0`,
  svelte `^5.55.7`, adapter-auto `^6.1.0`, adapter-cloudflare `^7.2.9`
- `packages/unocss`: peer kit `^2.0.0`, dev kit `^2.70.3`
- root: vite `^7.3.5`, vite-plugin-svelte `^6.2.0`, svelte `^5.55.7`
  (also in `overrides`), peer TypeScript `^5.9.2`

Staying on kit 2 while the ecosystem moves to kit 3 means stale adapters,
peer warnings on every install, and no access to kit 3 fixes. Doing the bump as
one atomic change keeps the workspace on a single consistent toolchain instead
of drifting into a mixed kit 2 / kit 3 state.

## What

Bump in `apps/learn` and `packages/unocss` (plus the root workspace
peers/`overrides` that pin the same toolchain, so the monorepo resolves one
copy):

- `@sveltejs/kit` `2.70.3` -> `3.x`
- `vite` `7` -> `8`
- `@sveltejs/vite-plugin-svelte` `6` -> `7`
- `typescript` `5` -> `6`
- `svelte` `^5.55.7` -> `>= 5.57.1`
- `@sveltejs/adapter-auto` / `@sveltejs/adapter-cloudflare` -> kit-3-compatible
  majors (exact versions resolved at implementation time against the kit 3.x
  peer ranges)
- Regenerate `bun.lock` with the pinned bun (`1.4.4` per `packageManager`)
- Apply required kit 3 / vite 8 / TS 6 migration edits (config, adapter
  options, removed APIs)

Known peer matrix (`@sveltejs/kit` 3.2.0):

| Package                            | Required range |
| ---------------------------------- | -------------- |
| `vite`                             | `^8.0.12`      |
| `@sveltejs/vite-plugin-svelte`     | `^7.0.0`       |
| `svelte`                           | `^5.57.1`      |
| `typescript`                       | `^6.0.0`       |

Gates (all must pass, in this order):

1. Frozen install: `bun install --frozen-lockfile`
2. Lint: `bun run lint` (0 errors, 0 warnings)
3. Type checks: `bun run check:types` and `bun run check:svelte`
4. `apps/learn` Cloudflare-adapter build: `bun run build` in `apps/learn`
5. Full suite: `bun run test:ci`

Out of scope: adopting new kit 3 features, changing the Cloudflare deployment
target, bumping unrelated dependencies.

## Impact

- `apps/learn/package.json`, `packages/unocss/package.json`, root
  `package.json` (peers/`overrides`), `bun.lock`
- Possible code churn from kit 3 / vite 8 / Svelte 5.57+ / TS 6 breaking
  changes (adapter config, `svelte.config.js`, type errors surfaced by the
  stricter compiler)
- CI stays on bun `1.4.4` (lockfile, `packageManager`, and `check.yml` pin
  already agree); no CI version change needed

## Risks

- **Adapter lag**: a kit-3-compatible adapter-cloudflare major may trail kit;
  if none satisfies the peer range, the change blocks until it ships.
- **Vite 8 plugin drift**: unocss/vitest/plugin versions may need coordinated
  bumps; the frozen-install gate catches silent peer mismatches.
- **TS 6 strictness**: new errors in `.svelte` files surface only via
  `svelte-check`, not `tsc`; the gate list runs both for this reason.
- **Lock churn**: a full toolchain major rewrites large parts of `bun.lock`;
  review the diff for unexpected downgrades before merging.
