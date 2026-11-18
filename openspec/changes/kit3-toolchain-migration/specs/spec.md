# Spec: kit3-toolchain-migration

## Scenario: Toolchain versions satisfy the kit 3 peer matrix

Given a fresh checkout of the branch
When the reviewer inspects `apps/learn/package.json`,
`packages/unocss/package.json`, and root `package.json`
Then `@sveltejs/kit` resolves to `3.x` everywhere, `vite` to `8.x`,
`@sveltejs/vite-plugin-svelte` to `7.x`, `svelte` to `>= 5.57.1`, and
`typescript` to `6.x`
And no package retains a kit `^2` peer or dev range.

## Scenario: Frozen install is reproducible

Given a clean tree with no `node_modules`
When `bun install --frozen-lockfile` runs with bun `1.4.4`
Then it exits 0 with no peer warnings for kit, vite, plugin-svelte, svelte,
typescript, or the adapters.

## Scenario: Lint and type gates pass

When `bun run lint` runs
Then it exits 0 with 0 errors and 0 warnings.
When `bun run check:types` and `bun run check:svelte` run
Then both exit 0.

## Scenario: Learn app builds with the Cloudflare adapter

When `bun run build` runs in `apps/learn`
Then it exits 0
And the output is produced through the kit-3-compatible
`@sveltejs/adapter-cloudflare`.

## Scenario: Full test suite passes

When `bun run test:ci` runs
Then it exits 0 with no failing tests.
