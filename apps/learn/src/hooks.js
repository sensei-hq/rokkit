import { deLocalizeUrl } from '#lib/paraglide/runtime.js'

/** @type {import('@sveltejs/kit/hooks').Reroute} */
export function reroute({ url }) {
	const delocalized = deLocalizeUrl(url)
	return delocalized.pathname
}
