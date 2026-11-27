/**
 * Pure helpers over a flat view (`{ key, type, proxy }` nodes) and a key → proxy lookup.
 *
 * Wrapper owns the reactive state; these answer the questions it asks of that state — which
 * node is next, which keys a range spans, which key holds a value — without touching it.
 */

/**
 * A separator or spacer: layout, never a control.
 * @param {{ type?: string }} node
 */
const isStructural = (node) => node.type === 'separator' || node.type === 'spacer'

/**
 * Whether keyboard navigation can land on a node: not layout, not disabled, not static.
 * @param {{ type?: string, proxy: { disabled?: boolean } }} node
 * @param {(proxy: unknown) => boolean} isStatic
 * @returns {boolean}
 */
export function isNavigableNode(node, isStatic) {
	return !isStructural(node) && !node.proxy.disabled && !isStatic(node.proxy)
}

/**
 * The key `delta` steps from `key` in `nav`, or null past either end. A key that is not in
 * `nav` sits just before the first node, so stepping forward from it lands on the first.
 * @param {Array<{ key: string }>} nav
 * @param {string | null} key
 * @param {number} delta
 * @returns {string | null}
 */
export function stepKey(nav, key, delta) {
	const target = nav.findIndex((n) => n.key === key) + delta
	return target >= 0 && target < nav.length ? nav[target].key : null
}

/**
 * The parent of a dash-separated path key, or null at the root.
 * @param {string} key
 * @returns {string | null}
 */
export function parentKey(key) {
	const parts = key.split('-')
	if (parts.length < 2) return null
	parts.pop()
	return parts.join('-')
}

/**
 * Keys from `fromKey` to `toKey` inclusive, in `nav` order — direction-agnostic, so a range
 * dragged upwards matches one dragged downwards. Null when either end is not in `nav`.
 * @param {Array<{ key: string }>} nav
 * @param {string} fromKey
 * @param {string} toKey
 * @returns {string[] | null}
 */
export function spanKeys(nav, fromKey, toKey) {
	const from = nav.findIndex((n) => n.key === fromKey)
	const to = nav.findIndex((n) => n.key === toKey)
	if (from < 0 || to < 0) return null
	return nav.slice(Math.min(from, to), Math.max(from, to) + 1).map((n) => n.key)
}

/**
 * The key of the first node after `startAfterKey` (wrapping) whose label starts with `query`,
 * case-insensitively; from the top when there is no start key. Null when nothing matches.
 * @param {Array<{ key: string, proxy: { label: string } }>} nav
 * @param {string} query
 * @param {string | null} startAfterKey
 * @returns {string | null}
 */
export function findByPrefix(nav, query, startAfterKey) {
	if (!nav.length) return null
	const q = query.toLowerCase()
	const start = startAfterKey ? nav.findIndex((n) => n.key === startAfterKey) + 1 : 0
	for (let i = 0; i < nav.length; i++) {
		const node = nav[(start + i) % nav.length]
		if (node.proxy.label.toLowerCase().startsWith(q)) return node.key
	}
	return null
}

/**
 * The key of the first proxy whose value is `value` (by identity), or null.
 * @param {Map<string, { value: unknown }>} lookup
 * @param {unknown} value
 * @returns {string | null}
 */
export function keyOfValue(lookup, value) {
	for (const [key, proxy] of lookup) {
		if (proxy.value === value) return key
	}
	return null
}

/**
 * Keys of the leaves whose value is in `values`, matched by identity.
 * @param {Map<string, { value: unknown, hasChildren: boolean }>} lookup
 * @param {unknown[]} values
 * @returns {string[]}
 */
export function leafKeysWithValues(lookup, values) {
	const keys = []
	for (const [key, proxy] of lookup) {
		if (!proxy.hasChildren && values.includes(proxy.value)) keys.push(key)
	}
	return keys
}

/**
 * The values behind `keys`, in order, skipping any key with no proxy.
 * @param {Iterable<string>} keys
 * @param {Map<string, { value: unknown }>} lookup
 * @returns {unknown[]}
 */
export function valuesOfKeys(keys, lookup) {
	const out = []
	for (const key of keys) {
		const proxy = lookup.get(key)
		if (proxy !== undefined) out.push(proxy.value)
	}
	return out
}
