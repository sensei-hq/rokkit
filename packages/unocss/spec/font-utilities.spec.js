import { describe, it, expect } from 'vitest'
import { createGenerator } from 'unocss'
import { presetRokkit } from '../src/preset.js'

// A font utility reads the font role a config sets, never a face and never the wind
// preset's system stack: change `typography.display` and every `font-display` follows.
// The canonical roles are display · ui · mono (typography.js); heading · sans · body are
// the older spellings of the same two roles and read the same variables.
const ROLES = {
	'font-display': 'var(--font-display)',
	'font-heading': 'var(--font-display)',
	'font-ui': 'var(--font-ui)',
	'font-sans': 'var(--font-ui)',
	'font-body': 'var(--font-ui)',
	'font-mono': 'var(--font-mono)'
}

const familyOf = (css, cls) => css.match(new RegExp(`\\.${cls}\\{font-family:([^;}]+)`))?.[1]

describe('font utilities', () => {
	it.each(Object.entries(ROLES))('%s reads %s', async (cls, variable) => {
		const uno = await createGenerator({ presets: [presetRokkit()] })
		const { css } = await uno.generate(cls, { preflights: false })
		expect(familyOf(css, cls), css).toBe(variable)
	})
})
