/**
 * Wrapper
 *
 * Navigation controller for persistent list/tree/sidebar components.
 * Accepts a ProxyTree instance for reactive data (flatView, lookup),
 * and provides full navigation, expansion, selection, and typeahead logic.
 *
 * ProxyTree owns the data layer: items -> proxies -> flatView + lookup.
 * Wrapper owns the navigation layer: focusedKey, movement, selection callbacks.
 *
 * Designed for any persistent (always-visible) component:
 *   - Sidebar navigation (links, collapsible groups)
 *   - List / Tree components
 *   - Any option list rendered inline
 *
 * Dropdown variants (Select, Menu) extend this class and override cancel() / blur()
 * to close the dropdown and return focus to the trigger.
 *
 * Multi-select opt-in: pass `multiselect: true` to enable extend(path) and
 * range(path) — ctrl/cmd-click and shift-click respectively. When false
 * (default), both methods are no-ops so existing single-select consumers
 * are unaffected.
 */

import { SvelteSet } from 'svelte/reactivity'
import {
	findByPrefix,
	isNavigableNode,
	keyOfValue,
	leafKeysWithValues,
	parentKey,
	spanKeys,
	stepKey,
	valuesOfKeys
} from './flat-nav.js'

export class Wrapper {
	// ─── Data ──────────────────────────────────────────────────────────────────

	#proxyTree

	// flatView: re-derives from proxyTree's flatView, which itself re-derives
	// when any proxy.expanded or proxy.children changes.
	flatView = $derived(this.#proxyTree.flatView)

	// Navigable items: exclude separators, spacers, and disabled items — and, in a
	// display-only list (selectable: false), a leaf with no link, which is no control.
	// This is the subset that keyboard navigation moves through.
	#navigable = $derived(this.flatView.filter((n) => isNavigableNode(n, (p) => this.#isStatic(p))))

	// ─── State ──────────────────────────────────────────────────────────────────

	#focusedKey = $state(null)

	// ─── Callbacks ──────────────────────────────────────────────────────────────

	#onselect
	#onchange
	#onselectionchange
	#selectedValue = $state(undefined)

	#collapsible
	#selectable

	// ─── Multi-select ──────────────────────────────────────────────────────────

	#multiselect
	#selectedKeys = new SvelteSet()
	#anchorKey = $state(null)

	/**
	 * @param {import('./proxy-tree.svelte.js').ProxyTree} proxyTree
	 * @param {{ onselect?: Function, onchange?: Function, onselectionchange?: (values: unknown[]) => void, collapsible?: boolean, multiselect?: boolean, selectable?: boolean }} [options]
	 */
	constructor(proxyTree, options = {}) {
		this.#proxyTree = proxyTree
		this.#onselect = options.onselect
		this.#onchange = options.onchange
		this.#onselectionchange = options.onselectionchange
		this.#collapsible = options.collapsible ?? true
		this.#multiselect = options.multiselect ?? false
		this.#selectable = options.selectable ?? true
	}

	/** A leaf with no link in a display-only list: shown, never focused or selected. */
	#isStatic(proxy) {
		return !this.#selectable && !proxy.hasChildren && !proxy.get('href')
	}

	// ─── IWrapper: state read by Navigator ─────────────────────────────────────

	get focusedKey() {
		return this.#focusedKey
	}

	// ─── IWrapper: movement (path passed through but ignored) ──────────────────

	/** Move focus to the next navigable item; clamp at end. */
	next(_path) {
		this.#step(1)
	}

	/** Move focus to the previous navigable item; clamp at start. */
	prev(_path) {
		this.#step(-1)
	}

	/**
	 * Move focus `delta` navigable items; stay put past either end.
	 * @param {number} delta
	 */
	#step(delta) {
		const key = stepKey(this.#navigable, this.#focusedKey, delta)
		if (key !== null) this.#focusedKey = key
	}

	/** Move focus to the first navigable item. */
	first(_path) {
		const nav = this.#navigable
		if (nav.length) this.#focusedKey = nav[0].key
	}

	/** Move focus to the last navigable item. */
	last(_path) {
		const nav = this.#navigable
		if (nav.length) this.#focusedKey = nav[nav.length - 1].key
	}

	/**
	 * Expand focused group, or move focus into it if already open.
	 * No-op on leaf items. When collapsible=false groups are always open,
	 * so this only ever moves focus into the first child.
	 */
	expand(_path) {
		if (!this.#focusedKey) return
		const node = this.flatView.find((n) => n.key === this.#focusedKey)
		if (!node || !node.hasChildren) return
		if (!node.proxy.expanded) {
			node.proxy.expanded = true
		} else {
			// Already open — advance focus to first visible child
			this.next(null)
		}
	}

	/**
	 * Move focus to the parent key by stripping the last segment.
	 * No-op at root level.
	 */
	#focusParent() {
		const parent = parentKey(this.#focusedKey)
		if (parent !== null) this.#focusedKey = parent
	}

	/**
	 * Collapse focused group, or move focus to parent if already collapsed / leaf.
	 * At root level with no parent: no-op.
	 * When collapsible=false, skips closing the group but still moves focus to parent.
	 */
	 
	collapse(_path) {
		if (!this.#focusedKey) return
		const node = this.flatView.find((n) => n.key === this.#focusedKey)
		/* v8 ignore start -- unreachable: focusedKey is only ever set from flatView and
		   the ProxyTree is immutable after construction (no items setter, no update()),
		   so a focused key cannot go stale. Kept as a guard in case the tree gains
		   mutation. `ignore next` does not fire on a single-line `if (...) return`. */
		if (!node) return
		/* v8 ignore stop */
		const canCollapse = node.hasChildren && node.proxy.expanded && this.#collapsible
		if (canCollapse) {
			node.proxy.expanded = false
		} else {
			this.#focusParent()
		}
	}

	// ─── IWrapper: selection actions ───────────────────────────────────────────

	/**
	 * Fire value-change callbacks for a leaf selection.
	 * In multi-select mode, replaces selectedKeys with just this key
	 * (matching ListController's single-click semantics).
	 * @param {*} proxy
	 * @param {string} key
	 */
	#selectLeaf(proxy, key) {
		if (this.#multiselect) {
			this.#commit(() => {
				this.#selectedKeys.clear()
				this.#selectedKeys.add(key)
			})
		}
		if (proxy.value !== this.#selectedValue) {
			this.#selectedValue = proxy.value
			this.#onchange?.(proxy.value, proxy)
		}
		this.#onselect?.(proxy.value, proxy)
	}

	/**
	 * Select item at path (or focusedKey when path is null).
	 * Groups toggle expanded (only when collapsible=true). Leaves fire onchange and onselect callbacks.
	 */
	#selectProxy(proxy, key) {
		if (proxy.hasChildren) {
			if (this.#collapsible) proxy.expanded = !proxy.expanded
		} else {
			this.#selectLeaf(proxy, key)
		}
	}

	select(path) {
		const key = path ?? this.#focusedKey
		if (!key) return
		const proxy = this.#proxyTree.lookup.get(key)
		if (!proxy || this.#isStatic(proxy)) return
		this.#focusedKey = key
		this.#anchorKey = key
		this.#selectProxy(proxy, key)
	}

	/**
	 * Toggle expansion of group at path — called by Navigator for accordion-trigger clicks.
	 * Unlike select(), this only applies to groups and never fires onselect.
	 * No-op when collapsible=false.
	 */
	 
	toggle(path) {
		if (!this.#collapsible) return
		const key = path ?? this.#focusedKey
		if (key) {
			const proxy = this.#proxyTree.lookup.get(key)
			if (proxy?.hasChildren) proxy.expanded = !proxy.expanded
		}
	}

	/**
	 * Sync focused state to path — called by Navigator on focusin and typeahead match.
	 */
	moveTo(path) {
		if (path !== null) this.#focusedKey = path
	}

	/**
	 * Sync focused key to the item matching this semantic value.
	 * Used by controlled components (Toggle, Select) to keep navigation
	 * in sync when the bound value changes externally.
	 *
	 * @param {unknown} v
	 */
	moveToValue(v) {
		if (v === undefined || v === null) return
		const key = keyOfValue(this.#proxyTree.lookup, v)
		if (key === null) return
		this.#focusedKey = key
		this.#selectedValue = v
	}

	/** Persistent list: no dropdown to close. Override in dropdown wrappers. */
	cancel(_path) {}

	/** Persistent list: no-op. Override in dropdown wrappers to close + restore trigger focus. */
	blur() {}

	/**
	 * Multi-select toggle — Ctrl/Cmd-click or Ctrl/Cmd-Space.
	 * When `multiselect: false` (default) this is a no-op so single-select
	 * consumers see the same behavior as before.
	 *
	 * Toggles `path` in `selectedKeys`, sets anchor for subsequent range select,
	 * and fires `onselect` for leaf targets. Group targets update focus + anchor
	 * but do not toggle into selectedKeys (groups aren't selectable values).
	 *
	 * @param {string|null} path
	 */
	extend(path) {
		if (!this.#multiselect) return
		const key = path ?? this.#focusedKey
		if (!key) return
		const proxy = this.#proxyTree.lookup.get(key)
		if (!proxy) return

		this.#focusedKey = key
		this.#anchorKey = key
		if (proxy.hasChildren) return

		this.#commit(() => this.#toggleSelected(key))
		this.#onselect?.(proxy.value, proxy)
	}

	/**
	 * Apply a change to the selection, and report the new set when it actually changed —
	 * a re-click of the sole selected row is not a change.
	 * @param {() => void} change
	 */
	#commit(change) {
		const before = [...this.#selectedKeys].join('\u0000')
		change()
		if ([...this.#selectedKeys].join('\u0000') !== before) this.#onselectionchange?.(this.selected)
	}

	/**
	 * Flip one key's membership in the selection set.
	 * @param {string} key
	 */
	#toggleSelected(key) {
		if (this.#selectedKeys.has(key)) this.#selectedKeys.delete(key)
		else this.#selectedKeys.add(key)
	}

	/**
	 * Multi-select range — Shift-click or Shift-Space.
	 * Selects every navigable item from the anchor (last single-click target,
	 * or the focused item if no anchor) to `path`, inclusive. Replaces any
	 * existing selection.
	 *
	 * When `multiselect: false` (default) this is a no-op.
	 *
	 * @param {string|null} path
	 */
	range(path) {
		if (!this.#multiselect) return
		const key = path ?? this.#focusedKey
		if (!key) return

		const anchorKey = this.#anchorKey ?? this.#focusedKey
		if (!anchorKey) {
			this.select(path)
			return
		}

		const span = spanKeys(this.#navigable, anchorKey, key)
		if (span) this.#replaceSelection(span, key)
	}

	/**
	 * Replace the entire selection with `keys`, move focus to `key`, and notify
	 * for a leaf target (groups aren't selectable values).
	 *
	 * @param {string[]} keys
	 * @param {string} key
	 */
	#replaceSelection(keys, key) {
		// Leaves only: a range swept across a group header must not select the header — a
		// group is not a selectable value.
		const leaves = keys.filter((k) => !this.#proxyTree.lookup.get(k)?.hasChildren)
		this.#commit(() => {
			this.#selectedKeys.clear()
			for (const k of leaves) this.#selectedKeys.add(k)
		})
		this.#focusedKey = key

		const proxy = this.#proxyTree.lookup.get(key)
		if (proxy && !proxy.hasChildren) this.#onselect?.(proxy.value, proxy)
	}

	/**
	 * Multi-select inbound: make the selection exactly the leaves whose value is in `values`,
	 * matched by identity as `moveToValue` matches one. A no-op without `multiselect`.
	 *
	 * Does not fire `onselectionchange`: this is the owner telling the list what is selected,
	 * and echoing it back would loop a bound `values` through its own setter.
	 *
	 * @param {unknown[]} values
	 */
	moveToValues(values) {
		if (!this.#multiselect) return
		this.#selectedKeys.clear()
		for (const key of leafKeysWithValues(this.#proxyTree.lookup, values ?? [])) {
			this.#selectedKeys.add(key)
		}
	}

	// ─── IWrapper: typeahead ───────────────────────────────────────────────────

	/**
	 * Return the key of the first navigable item whose text starts with query
	 * (case-insensitive). Wraps around. startAfterKey enables cycling.
	 * Returns null if no match.
	 *
	 * @param {string} query
	 * @param {string|null} [startAfterKey]
	 * @returns {string|null}
	 */
	findByText(query, startAfterKey = null) {
		return findByPrefix(this.#navigable, query, startAfterKey)
	}

	// ─── Helpers for the component ─────────────────────────────────────────────

	/** @returns {Map<string, import('./proxy-item.svelte.js').ProxyItem>} */
	get lookup() {
		return this.#proxyTree.lookup
	}

	/** @returns {import('./proxy-tree.svelte.js').ProxyTree} */
	get proxyTree() {
		return this.#proxyTree
	}

	/**
	 * Reactive set of selected keys. Tracks meaningfully only when
	 * `multiselect: true` — in single-select mode it mirrors the most
	 * recent `select()` target (one key at a time).
	 *
	 * @returns {SvelteSet<string>}
	 */
	get selectedKeys() {
		return this.#selectedKeys
	}

	/**
	 * In multi-select mode: array of selected leaf values (in selectedKeys order).
	 * In single-select mode: the last selected value (back-compat with `select()`).
	 *
	 * @returns {unknown[] | unknown}
	 */
	get selected() {
		if (!this.#multiselect) return this.#selectedValue
		return valuesOfKeys(this.#selectedKeys, this.#proxyTree.lookup)
	}
}
