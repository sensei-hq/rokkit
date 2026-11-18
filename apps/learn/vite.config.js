import adapterAuto from '@sveltejs/adapter-auto'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { sveltekit } from '@sveltejs/kit/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'

// Adapter selection ("keep both" — Cloudflare + everything else):
//   - On Cloudflare (the project sets CF_PAGES=1; Workers Builds also sets
//     WORKERS_CI) use @sveltejs/adapter-cloudflare explicitly. It emits
//     .svelte-kit/cloudflare/_worker.js, which the committed wrangler.jsonc
//     deploys. Selecting it here (instead of letting adapter-auto auto-install
//     it at build time) avoids the frozen-lockfile auto-install failure.
//   - Everywhere else (local, Vercel, CI) adapter-auto picks the right target.
//     The site is NOT fully static — it has a server endpoint
//     (api/chat/interpret) and SSR routes — so it ships as a Worker, not a
//     prerendered bundle. Per-section prerender (guides/+layout.ts) still works.
//
// Kit 3: SvelteKit config lives here (svelte.config.js is no longer
// supported). `$lib` is likewise gone — imports use the `#lib` subpath
// import declared in package.json (`imports`), with explicit extensions.
const onCloudflare = Boolean(process.env.CF_PAGES) || Boolean(process.env.WORKERS_CI)
const adapter = onCloudflare ? adapterCloudflare() : adapterAuto()

export default defineConfig({
	plugins: [
		unocss(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'cookie', 'baseLocale']
		}),
		sveltekit({ adapter })
	],
	server: {
		fs: { allow: ['..', '.'] }
	},
	// @mlc-ai/web-llm ships its own bundled workers and uses dynamic imports
	// that confuse Vite's dependency optimiser (it hits a maximum call stack
	// transforming the package). Excluding from pre-bundling makes the dev
	// server fetch the module's own dist files directly, which works.
	optimizeDeps: {
		exclude: ['@mlc-ai/web-llm']
	},
	ssr: {
		noExternal: ['@mlc-ai/web-llm']
	}
})
