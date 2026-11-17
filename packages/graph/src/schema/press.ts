/**
 * The actor a design page hands the `interactions` action: a press on an element carrying
 * `data-graph-press="select"` opens the object its `data-graph-key` names; `clear` — the home
 * row's press — returns to the design. Nothing else on these pages is a press.
 */
import type { Intent } from '../state/intents.js'

export function pressTo(onselect: () => ((key: string | null) => void) | undefined) {
	return {
		act(intent: Intent, key: string | null): void {
			if (intent === 'select' && key) onselect()?.(key)
			else if (intent === 'clear') onselect()?.(null)
		}
	}
}
