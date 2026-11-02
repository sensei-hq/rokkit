/**
 * Default (English) messages for all UI components.
 * @type {import('./types').Messages}
 */
const defaultMessages = {
	emptyList: 'No items found',
	emptyTree: 'No data available',
	loading: 'Loading...',
	noResults: 'No results found',
	select: 'Select an option',
	search: 'Search...',
	list: { label: 'List' },
	tree: {
		label: 'Tree',
		expand: 'Expand',
		collapse: 'Collapse',
		loading: 'Loading',
		loadMore: 'Load More'
	},
	toolbar: { label: 'Toolbar' },
	menu: { label: 'Menu' },
	toggle: { label: 'Selection' },
	rating: { label: 'Rating' },
	stepper: { label: 'Progress' },
	breadcrumbs: { label: 'Breadcrumb' },
	carousel: {
		label: 'Carousel',
		prev: 'Previous slide',
		next: 'Next slide',
		slides: 'Slide navigation'
	},
	tabs: { add: 'Add tab', remove: 'Remove tab', placeholder: 'Select a tab to view its content.' },
	table: { empty: 'No data', sortAscending: 'Sort ascending', sortDescending: 'Sort descending' },
	code: { copy: 'Copy code', copied: 'Copied!' },
	range: { lower: 'Lower bound', upper: 'Upper bound', value: 'Value' },
	search_: { clear: 'Clear search' },
	filter: { remove: 'Remove filter' },
	grid: { label: 'Grid' },
	uploadProgress: {
		label: 'Upload progress',
		clear: 'Clear all',
		cancel: 'Cancel',
		retry: 'Retry',
		remove: 'Remove'
	},
	uploadTarget: {
		dropzone: 'File upload drop zone'
	},
	floatingNav: { label: 'Page navigation', pin: 'Pin navigation', unpin: 'Unpin navigation' },
	mode: { system: 'System', light: 'Light', dark: 'Dark' },
	command: {
		placeholder: 'Run a command…',
		noResults: 'No commands found',
		label: 'Command palette'
	},
	graph: {
		// The canvas and its state
		diagram: 'Diagram of {nodes} and {edges}',
		nodeOne: '{n} node',
		nodeMany: '{n} nodes',
		relationshipOne: '{n} relationship',
		relationshipMany: '{n} relationships',
		more: '+ {n} more',
		less: 'show less',
		noKeys: 'no keys · {rows}',
		rowOne: '{n} row',
		rowMany: '{n} rows',
		open: 'Open {name}',
		expand: 'Expand {name}',
		expandCount: 'Expand · {n}',
		collapse: 'Collapse {name}',
		layer: 'Layer {n}',
		layerUnassigned: 'Unassigned',
		sideBelow: 'Declared',
		sideAbove: 'Observed',
		// Drill bar
		drillPath: 'Drill path',
		drillRoot: 'All',
		drillLoading: 'Loading…',
		drillError: 'Could not open: {message}',
		// Legend and measures
		legend: 'Legend',
		legendHidden: 'Hidden coupling',
		legendCap: 'full at {cap}',
		width: 'Width',
		height: 'Height',
		shade: 'Shade',
		shadeScale: 'none → all',
		measureNone: 'none',
		// Controls
		detailLevel: 'Detail level',
		densityNames: 'Names',
		densityNamesTitle: 'Titles only',
		densityKeys: 'Keys',
		densityKeysTitle: 'Key rows only',
		densityFull: 'All',
		densityFullTitle: 'All rows',
		levelsShown: 'Levels shown',
		levelOne: '{n} level',
		levelMany: '{n} levels',
		zoom: 'Zoom',
		zoomOut: 'Zoom out',
		zoomReset: 'Reset zoom to fit',
		zoomIn: 'Zoom in',
		bundled: 'Bundled',
		bundledTitle: 'Edges follow the hierarchy',
		straight: 'Straight',
		straightTitle: 'Edges run straight across',
		angled: 'Angled',
		angledTitle: 'Right-angle connectors',
		curved: 'Curved',
		curvedTitle: 'Curved connectors',
		violationsOnly: 'Violations only',
		violationsOnlyTitle: 'Showing only the edges that climb a layer',
		allEdges: 'All edges',
		allEdgesTitle: 'Showing every edge',
		hiddenOnly: 'Hidden only',
		hiddenOnlyTitle: 'Showing only coupling no import explains',
		allPairs: 'All pairs',
		allPairsTitle: 'Showing every pair',
		// Entity views
		entity: 'Entity',
		rows: 'Rows',
		refs: 'Refs',
		comment: 'Comment',
		columns: 'Columns',
		columnOne: '{n} column',
		columnMany: '{n} columns',
		indexes: 'Indexes',
		unique: 'unique',
		relationships: 'Relationships',
		noRelationships: 'No relationships reference this entity.',
		noEntity: 'No entity selected.',
		// Database design views — kinds, one and many
		kindTableOne: 'Table',
		kindTableMany: 'Tables',
		kindViewOne: 'View',
		kindViewMany: 'Views',
		kindMaterializedViewOne: 'Materialized view',
		kindMaterializedViewMany: 'Materialized views',
		kindFunctionOne: 'Function',
		kindFunctionMany: 'Functions',
		kindProcedureOne: 'Procedure',
		kindProcedureMany: 'Procedures',
		kindTriggerOne: 'Trigger',
		kindTriggerMany: 'Triggers',
		kindSequenceOne: 'Sequence',
		kindSequenceMany: 'Sequences',
		kindEnumOne: 'Enum',
		kindEnumMany: 'Enums',
		kindSchemaOne: 'Schema',
		kindSchemaMany: 'Schemas',
		kindReferenceOne: 'Reference',
		kindReferenceMany: 'References',
		// Database design views — the header and its tabs
		statTableOne: '{n} table',
		statTableMany: '{n} tables',
		statEnumOne: '{n} enum',
		statEnumMany: '{n} enums',
		statRefOne: '{n} ref',
		statRefMany: '{n} refs',
		tabOverview: 'Overview',
		tabDiagram: 'Diagram',
		tabEntities: 'Entities',
		tabDetails: 'Details',
		designTabs: 'Design views',
		// Database design views — the overview
		atAGlance: 'At a glance',
		modelVersion: 'schema model v{n}',
		notes: 'Notes',
		schemaName: 'Schema',
		schemaTables: 'Tables',
		schemaEnums: 'Enums',
		schemaRoutines: 'Views & routines',
		noSchemas: 'This design has no schemas.',
		// Database design views — an entity's page
		entityNotFound: 'Entity not found.',
		tableInfo: 'Table info',
		info: 'Info',
		fields: 'Fields',
		fieldName: 'Name',
		fieldType: 'Type',
		fieldSettings: 'Settings',
		fieldDefault: 'Default',
		fieldReferences: 'References',
		fieldNotes: 'Notes',
		references: 'References',
		noReferences: 'No foreign keys in or out.',
		refOut: 'out',
		refIn: 'in',
		refCounts: '{out} out · {in} in',
		dependencies: 'Dependencies',
		noDependents: 'Nothing reads, writes or calls this table.',
		checks: 'Checks',
		badgePk: 'PK',
		badgeFk: 'FK',
		badgeNn: 'NN',
		badgeUq: 'UNIQUE',
		badgeEnum: 'ENUM',
		badgeIdentity: 'IDENTITY',
		badgeGenerated: 'GENERATED',
		indexWhere: 'where {predicate}',
		noTableComment: 'No comment on this table.',
		noComment: 'No comment on this {kind}.',
		stubExternal: 'Declared external — this design references it but does not manage it.',
		stubOutOfScope: 'A table of this design that the scope this model was drawn for leaves out.',
		stubUnresolved: 'Referenced by a foreign key, but defined nowhere in this design.',
		stubColumns: 'Only the columns its foreign keys land on are shown.',
		uses: 'Uses',
		usedBy: 'Used by',
		usageCounts: '{uses} uses · {usedBy} used by',
		usesNothing: 'It reads, writes and calls nothing in this design.',
		usedByNothing: 'Nothing in this design uses it.',
		sequenceUntraced:
			'No dependency in this model names it — a column default that calls nextval() is not traced.',
		notDefined: 'Not defined in this design',
		values: 'Values',
		valueOne: '{n} value',
		valueMany: '{n} values',
		noEnumColumns: 'No column in this design is of this type.',
		dependenciesOf: 'Dependencies of {name}',
		relationshipsOf: 'Relationships of {name}',
		erDiagram: '{name} entity relationship diagram',
		erDiagramUnnamed: 'Entity relationship diagram',
		// Database design views — the sidebar
		designHome: 'Design overview',
		findEntity: 'Find an entity…',
		showKinds: 'Show entity types',
		nothingMatches: 'Nothing matches “{query}”.',
		allKindsOff: 'Every entity type is switched off.',
		noEntities: 'This design has no entities.',
		// Dependency matrix
		matrix: 'Dependency matrix: {nodes}, {dependencies}, {above} above the diagonal',
		dependencyOne: '{n} dependency',
		dependencyMany: '{n} dependencies'
	}
}

/**
 * Deep-merge `overrides` onto `base`. One level deep for nested objects.
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} overrides
 * @returns {Record<string, unknown>}
 */
function deepMerge(base, overrides) {
	const result = { ...base }
	for (const key of Object.keys(overrides)) {
		const isObj = (v) => typeof v === 'object' && v !== null
		result[key] =
			isObj(overrides[key]) && isObj(result[key])
				? { ...result[key], ...overrides[key] }
				: overrides[key]
	}
	return result
}

class MessagesStore {
	#registry = {}
	#locale = 'en'

	// ─── Flat string keys ─────────────────────────────────────────────────────

	emptyList = $state(defaultMessages.emptyList)
	emptyTree = $state(defaultMessages.emptyTree)
	loading = $state(defaultMessages.loading)
	noResults = $state(defaultMessages.noResults)
	select = $state(defaultMessages.select)
	search = $state(defaultMessages.search)

	// ─── Nested component namespaces ──────────────────────────────────────────

	list = $state({ ...defaultMessages.list })
	tree = $state({ ...defaultMessages.tree })
	toolbar = $state({ ...defaultMessages.toolbar })
	menu = $state({ ...defaultMessages.menu })
	toggle = $state({ ...defaultMessages.toggle })
	rating = $state({ ...defaultMessages.rating })
	stepper = $state({ ...defaultMessages.stepper })
	breadcrumbs = $state({ ...defaultMessages.breadcrumbs })
	carousel = $state({ ...defaultMessages.carousel })
	tabs = $state({ ...defaultMessages.tabs })
	table = $state({ ...defaultMessages.table })
	code = $state({ ...defaultMessages.code })
	range = $state({ ...defaultMessages.range })
	search_ = $state({ ...defaultMessages.search_ })
	filter = $state({ ...defaultMessages.filter })
	grid = $state({ ...defaultMessages.grid })
	uploadProgress = $state({ ...defaultMessages.uploadProgress })
	uploadTarget = $state({ ...defaultMessages.uploadTarget })
	floatingNav = $state({ ...defaultMessages.floatingNav })
	mode = $state({ ...defaultMessages.mode })
	command = $state({ ...defaultMessages.command })
	graph = $state({ ...defaultMessages.graph })

	// ─── Active locale ─────────────────────────────────────────────────────────

	/** Currently active locale tag (read-only). */
	get locale() {
		return this.#locale
	}

	// ─── Internals ─────────────────────────────────────────────────────────────

	#apply() {
		const overrides = this.#registry[this.#locale]
		const computed = overrides
			? /** @type {import('./types').Messages} */ (deepMerge(defaultMessages, overrides))
			: structuredClone(defaultMessages)
		Object.assign(this, computed)
	}

	// ─── Public API ────────────────────────────────────────────────────────────

	/**
	 * Register translation overrides for a locale. Unspecified keys fall back to English defaults.
	 * @param {string} locale — BCP 47 tag or any identifier (e.g. 'de', 'fr-CA')
	 * @param {Partial<import('./types').Messages>} overrides
	 */
	register(locale, overrides) {
		this.#registry = { ...this.#registry, [locale]: overrides }
		this.#apply()
	}

	/**
	 * Switch to a previously registered locale. Use 'en' to restore English defaults.
	 * @param {string} locale
	 */
	setLocale(locale) {
		this.#locale = locale
		this.#apply()
	}

	/**
	 * Apply one-off overrides without naming a locale (convenience / backward compat).
	 * @param {Partial<import('./types').Messages>} overrides
	 */
	set(overrides) {
		this.#registry = { ...this.#registry, _custom: overrides }
		this.#locale = '_custom'
		this.#apply()
	}

	/**
	 * Reset to English defaults and clear all registered locales.
	 */
	reset() {
		this.#registry = {}
		this.#locale = 'en'
		this.#apply()
	}
}

/**
 * Reactive messages store. Access strings directly: `messages.select`, `messages.tree.expand`.
 * Configure locale: `messages.register('de', {...})` + `messages.setLocale('de')`.
 */
export const messages = new MessagesStore()
