import { TYPEAHEAD_RESET_MS } from '../nav-constants.js'

/**
 * One printable character that is not Space (Space selects).
 * @param {string} key
 */
const isPrintable = (key) => key.length === 1 && key !== ' '

/**
 * Type-to-find: printable keys accumulate into one search string until the reader pauses for
 * `TYPEAHEAD_RESET_MS`, so typing "ma" finds "Mango" rather than jumping to "M…" then "A…".
 */
export class Typeahead {
	#buffer = ''
	#timer = null

	/**
	 * A single printable character with no modifier (shift is fine). Space is excluded — it
	 * selects.
	 * @param {{ key: string, ctrlKey: boolean, metaKey: boolean, altKey: boolean }} event
	 */
	accepts({ key, ctrlKey, metaKey, altKey }) {
		const modified = ctrlKey || metaKey || altKey
		return !modified && isPrintable(key)
	}

	/**
	 * Add a character and search. The first key of a search starts after the focused item, so
	 * repeating a letter walks through the items that start with it.
	 *
	 * @param {string} key
	 * @param {string | null} focusedKey
	 * @param {(text: string, startAfter: string | null) => string | null} find
	 * @returns {string | null} the matched item's key
	 */
	type(key, focusedKey, find) {
		const startAfter = this.#buffer.length === 0 ? focusedKey : null
		this.#buffer += key
		this.#restartTimer()
		return find(this.#buffer, startAfter)
	}

	#restartTimer() {
		clearTimeout(this.#timer)
		this.#timer = setTimeout(() => this.clear(), TYPEAHEAD_RESET_MS)
	}

	/** Drop the search and its pending reset. */
	clear() {
		this.#buffer = ''
		clearTimeout(this.#timer)
		this.#timer = null
	}
}
