/* Characterization: the sample specs the chat routes render. Sharing a dataset between two
 * specs must leave each one's value exactly as it was.
 */
import { describe, it, expect } from 'vitest'
import * as samples from '../../../src/lib/chat-demo/intent/samples'

describe('chat sample specs', () => {
	it.each(Object.entries(samples))('%s is unchanged', (_, value) => {
		expect(value).toMatchSnapshot()
	})

	it('the box and violin plots draw the same mpg-by-class rows with different geoms', () => {
		expect(samples.BOX_PLOT_SPEC.data).toEqual(samples.VIOLIN_PLOT_SPEC.data)
		expect(samples.BOX_PLOT_SPEC.geoms).toEqual([{ type: 'box' }])
		expect(samples.VIOLIN_PLOT_SPEC.geoms).toEqual([{ type: 'violin' }])
	})
})
