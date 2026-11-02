/* `@rokkit/graph/schema` is what dbd's site and sensei's app compose the design viewer from,
   so every view and helper they need is on it. */
import { describe, it, expect } from 'vitest'
import * as schema from '../../src/schema/index.js'

describe('@rokkit/graph/schema', () => {
	it.each([
		'EntityView',
		'EntitiesView',
		'NoteBlocks',
		'ContentHeader',
		'OverviewView',
		'DiagramView',
		'SchemaSidebar',
		'TableView',
		'ObjectView',
		'EnumView'
	])('exports the %s view', (name) => {
		expect(typeof (schema as Record<string, unknown>)[name]).toBe('function')
	})

	it.each([
		'toGraphInput',
		'withStubs',
		'pageFor',
		'entityAt',
		'allEntities',
		'kindCounts',
		'overviewCounts',
		'schemaRows',
		'headerStats',
		'designTabs',
		'sidebarTree',
		'tableDetail',
		'objectDetail',
		'enumDetail',
		'splitLead'
	])('exports the %s helper', (name) => {
		expect(typeof (schema as Record<string, unknown>)[name]).toBe('function')
	})
})
