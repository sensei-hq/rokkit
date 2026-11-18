# remove-kit-leftovers-and-stale-config

Remove Kit-2-era leftovers and stale config: root `svelte.config.js`,
root `vercel.json`, broken cli export entries, and the wrong icons build
binary name.

Scan findings: dead-D18, dead-D19, dead-D21, dead-D22 (dead-code scan,
safe removals/fixes).
Severity: Low (hygiene — dead config and unresolvable entries).

## Why

Kit 3 no longer supports `svelte.config.js` (the learn app has none;
re-verified root file only sets `runes:true`, the Svelte 5 default);
`vercel.json` names a `buildCommand` matching no root script while deploy
is Cloudflare; the cli manifest exports 7 `./*.json` entries pointing at
a `lib/` directory that does not exist (re-verified absent); and the
icons build script calls a `rokkit-cli` binary that does not exist (the
bin is `rokkit`).

## What

- Delete root `svelte.config.js`
- Delete root `vercel.json`
- `packages/cli/package.json`: drop the 7 unresolvable export entries
  (`./ui.json`, `./light.json`, `./solid.json`, `./twotone.json`,
  `./components.json`, `./auth.json`, `./app.json` -> `./lib/*.json`)
- `packages/icons/package.json`: fix build script `rokkit-cli` -> `rokkit`

Out of scope: the Kit-3-stale `detectSvelteKit` branch (finding D20 —
behaviour change, needs its own spec) and missing unocss subpath exports
(D23 — published-API change).

## Evidence

- D18 root `svelte.config.js` — Kit 3 unsupported per
  `apps/learn/vite.config.js:19-21` comment; learn has no svelte config
  (re-verified). Verify: `ls apps/learn/svelte*`;
  `sed -n '19,21p' apps/learn/vite.config.js`
- D19 root `vercel.json` — `buildCommand 'bun run build'` matches no
  root script (`build:all`/`build:apps` exist); deploy is Cloudflare
  (`wrangler.jsonc`, `.github/workflows/check.yml`). Verify: `rg -ln
  'vercel.json' docs/ apps/ config/ .github/`
- D21 cli exports `./ui.json` etc. -> `./lib/*.json`, but
  `packages/cli/lib/` absent (re-verified; knip 'entry file not found'
  x7). Verify: `ls packages/cli/lib`
- D22 icons build calls `rokkit-cli build`, cli bin is `{rokkit:
  src/index.js}` (re-verified). Verify: `rg -n 'rokkit-cli' packages/
  apps/ config/`
- Owners: repo root, `packages/cli`, `packages/icons` maintainers

## Impact

- No dead config at root; cli manifest exports only resolvable entries;
  icons build invokes a real binary

## Risks

- **External tooling reading root config**: some external script could
  reference `vercel.json`/`svelte.config.js`; mitigate with the verify
  greps plus a green full suite and Cloudflare build.
- **Icons build actually broken today**: if the build script never ran
  with the wrong name, fixing the name may surface a latent failure;
  mitigate by running the icons build as the acceptance gate.
