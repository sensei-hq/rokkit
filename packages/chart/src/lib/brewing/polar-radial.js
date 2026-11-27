/**
 * Radial scale for the radar/spider geom: how a value maps to a radius on one spoke, which
 * transform that mapping uses, and the shared grid (rings + zero markers) drawn against it.
 *
 * Split out of `polar.js` (which re-exports everything here) so the layout module stays a
 * readable size; like it, this holds no Svelte state and reaches into no chart context.
 */

/** @typedef {import('./polar.js').ResolvedAxis} ResolvedAxis */

/**
 * Maps a value to a radius, in pixels, for one axis of a radar/spider chart.
 *
 * The centre is `domain.min`, NOT zero: on a domain of `[-5, 10]` with `R = 100`, a value of 0
 * sits at `R * 5/15 ≈ 33.33`, not at the centre. Centring on 0 unconditionally would silently
 * misplace every axis whose domain doesn't start at zero — this follows `domainsFor`'s own
 * inferred-negative-domain rule (`[min, max]`, never clamped to 0): whatever `domainsFor` decided
 * an axis's low end is, THAT is the value drawn at the centre, not literal zero.
 *
 * `transform` is `'linear'` (`R * ratio`) or `'sqrt'` (`R * sqrt(ratio)`) — see
 * `resolveRadiusTransform` for why a caller would ever want the latter. Anything other than the
 * literal string `'sqrt'` is treated as `'linear'`.
 *
 * Two failure modes are handled explicitly rather than left to produce `NaN`:
 *
 * - A zero-width domain (`min === max`, e.g. the `[0, 0]` `domainsFor` returns for an axis
 *   absent from every row) would divide by zero. Rather than `NaN`, it resolves to `0` — the
 *   centre — continuing the promise `domainsFor`'s own doc comment already makes for that case:
 *   "enough for a caller to render an empty spoke without the radius math blowing up."
 * - A non-finite `value` (missing field, a stray string that slipped past upstream filtering)
 *   returns `null` rather than being coerced to some position. Plotting it anyway — at the
 *   centre, say — would silently reshape the polygon exactly the way `resolveAxes` already
 *   refuses to do for axis membership ("better a visible gap than a silently reshaped polygon").
 *   The geom is expected to break the line at a `null` vertex rather than draw a false one.
 *
 * A finite value outside `[min, max]` is clamped into `[0, R]` rather than left to overshoot the
 * ring (linear) or hand a negative ratio to `sqrt`, which has no real root and would produce
 * `NaN`. `domainsFor` treats an out-of-domain value as "the caller/renderer problem, not
 * domainsFor's" — `radiusFor` *is* that renderer, so this is where the clamp belongs.
 *
 * @param {number} value
 * @param {[number, number]} domain
 * @param {number} R - outer radius in pixels
 * @param {'linear'|'sqrt'} transform
 * @returns {number|null} radius in pixels, or `null` for a non-finite value
 */
export function radiusFor(value, domain, R, transform) {
	if (!Number.isFinite(value)) return null

	const [min, max] = domain
	const span = max - min
	if (span === 0) return 0

	let ratio = (value - min) / span
	if (ratio < 0) ratio = 0
	else if (ratio > 1) ratio = 1

	return transform === 'sqrt' ? R * Math.sqrt(ratio) : R * ratio
}

/**
 * Picks the radius transform for a radar chart, given its axis weights.
 *
 * A wedge's area is ~½θr². `anglesFor` already makes θ (a wedge's angular width) proportional to
 * weight for a weighted radar. If radius stayed linear in value, a heavily-weighted axis would get
 * both a wider wedge AND a radius growing at the ordinary linear rate for the same value — the two
 * compound, so swept area grows faster than `weight × value`, stacking on top of radar's already
 * well-known area exaggeration (a 2x difference in a linear radius already reads as ~4x in swept
 * area). Making radius track `√value` cancels exactly one factor of that compounding: with
 * `r² ∝ value`, area becomes `∝ θ * value ∝ weight * value` — the honest claim a weighted radar is
 * making about its data in the first place. (This module's spec asserts that proportionality
 * numerically rather than arguing it, since it is the entire reason this branch exists.)
 *
 * At equal weights every wedge is the same width regardless of transform, so there is nothing to
 * compensate for — `'linear'` is used, matching conventional radar (whose area exaggeration is a
 * documented, accepted limitation, not something this module tries to fix).
 *
 * `requested` lets a caller pin the transform explicitly; an explicit `'linear'` or `'sqrt'`
 * always wins over the weight-derived choice, so a consumer who has deliberately chosen one never
 * has it silently swapped out from under them the next time someone adds an unequal weight to the
 * axes list.
 *
 * Weights are normalised the same way `anglesFor` normalises them (non-positive or non-finite
 * treated as 1) before the equality check, so this function's answer always matches the wedges
 * `anglesFor` actually draws for the same `weights` array.
 *
 * @param {number[]} weights - one per axis, the same array `anglesFor` would receive
 * @param {'linear'|'sqrt'|'auto'} [requested] - defaults to `'auto'`
 * @returns {'linear'|'sqrt'}
 */
export function resolveRadiusTransform(weights, requested = 'auto') {
	if (requested === 'linear' || requested === 'sqrt') return requested

	const w = weights.map((x) => (Number.isFinite(x) && x > 0 ? x : 1))
	const allEqual = w.every((x) => x === w[0])
	return allEqual ? 'linear' : 'sqrt'
}

/**
 * @typedef {Object} Ring
 * @property {number} radius - pixels from centre
 * @property {(string|number)[]} labels - one label per axis, positionally aligned with `axes`
 */

/**
 * How many concentric rings the shared grid draws, and why it can only ever be one number
 * for the whole chart rather than one per axis.
 *
 * @param {ResolvedAxis[]} axes
 * @param {number} fallbackRings
 * @returns {number}
 */
function resolveRingCount(axes, fallbackRings) {
	const ticks = axes.map((axis) => axis.ticks)
	// Vacuously false when axes is empty, which is what we want: nothing to agree on, so fall
	// through to the fallback rather than reading `ticks[0]` off an empty array.
	const uniform = axes.length > 0 && ticks.every((t) => t !== undefined && t === ticks[0])
	if (uniform) return ticks[0]

	if (ticks.some((t) => t !== undefined)) {
		// eslint-disable-next-line no-console
		console.warn(
			'[Radar] AxisSpec.ticks differ across axes — falling back to `opts.rings` ' +
				`(${fallbackRings}) for the shared grid. The geom draws ONE grid, common to every ` +
				'spoke, so per-spoke ring counts cannot be honoured; declare the same `ticks` on ' +
				'every axis if a ring is meant to read as "k of n" everywhere.'
		)
	}
	return fallbackRings
}

/**
 * Inverts `radiusFor` to answer "what value does ring `ratio` (a fraction of R) sit at, on
 * THIS axis's domain and transform?" — needed because rings are laid out evenly in RADIUS
 * (see `ringsFor`), so the value a given ring represents depends on the axis's domain and,
 * under `sqrt`, on the transform too: `radius = R * sqrt(ratio)` inverts to `valueRatio =
 * ratio^2`, not `ratio` itself.
 *
 * @param {number} ratio - `i / ringCount`, the SAME fraction of R every ring uses
 * @param {[number, number]} domain
 * @param {'linear'|'sqrt'} transform
 * @returns {number}
 */
function valueAtRing(ratio, domain, transform) {
	const [min, max] = domain
	const valueRatio = transform === 'sqrt' ? ratio ** 2 : ratio
	return min + valueRatio * (max - min)
}

/**
 * Concentric grid rings for a radar chart — one shared set of circles, evenly spaced in
 * RADIUS, that every spoke is drawn against.
 *
 * Ring *i* sits at `(i / ringCount) * R`. This follows directly from `radiusFor`'s own linear
 * mapping between radius and normalised position: since every spoke shares one `R` and the
 * grid is one set of concentric circles (not one grid per axis), the only spacing that keeps
 * "ring 2 is twice as far out as ring 1" true on EVERY spoke simultaneously is spacing by
 * radius. Spacing the rings evenly in VALUE instead would only coincide with this for a
 * domain that starts at 0 (see the spec: a `[20, 120]`-style domain exposes the divergence,
 * because splitting an unanchored domain into equal value steps and converting each through
 * `radiusFor` on ITS OWN axis does not reduce to `(i/ringCount) * R` the way it would for a
 * zero-anchored domain).
 *
 * Ring COUNT has to be one number for the whole grid, because there is only one grid, drawn
 * once. When every `AxisSpec` declares the same `ticks`, that count is used verbatim and ring
 * *k* genuinely means "k of n" on every spoke. When they disagree, honouring any one axis's
 * count would silently mislabel every other axis's rings, so this falls back to `opts.rings`
 * (default 4) and warns — the geom cannot draw a different number of rings per spoke.
 *
 * Ring LABELS are resolved per axis (each ring has one label per axis, since the same radius
 * means a different value on each spoke): a declared `tickLabels` entry wins outright — it is
 * the ordinal vocabulary of a Likert-style axis and has no "value" to compute at all. Absent
 * that, the ring's value on that axis (via `valueAtRing`) is run through the axis's `format`
 * if one is given, else left as the bare number. A DECLARED domain makes this value a stable,
 * meaningful tick; an INFERRED one (no `domain` supplied anywhere for this axis) makes it only
 * an approximation of "if the current rows were the whole story."
 *
 * @param {ResolvedAxis[]} axes
 * @param {{ R: number, rings?: number, domains?: [number, number][], transform?: 'linear'|'sqrt' }} opts
 * @returns {Ring[]}
 */
export function ringsFor(axes, opts = {}) {
	const { R, rings: fallbackRings = 4, domains, transform = 'linear' } = opts
	const ringCount = resolveRingCount(axes, fallbackRings)

	return Array.from({ length: ringCount }, (_, idx) => {
		const i = idx + 1
		const radius = (i / ringCount) * R
		const labels = axes.map((axis, axisIndex) => {
			if (Array.isArray(axis.tickLabels) && axis.tickLabels[idx] !== undefined) {
				return axis.tickLabels[idx]
			}
			const domain = domains?.[axisIndex] ?? axis.domain ?? [0, 0]
			const value = valueAtRing(i / ringCount, domain, transform)
			return typeof axis.format === 'function' ? axis.format(value) : value
		})
		return { radius, labels }
	})
}

/**
 * Zero-reference marker, per axis — a dashed ring segment (in the geom, not here) at the
 * radius where the value 0 actually sits on that spoke.
 *
 * `radiusFor` centres each spoke on `domain.min`, not on 0, because `domainsFor` lets a
 * negative value extend a domain rather than clamping it. That is honest about the data but
 * has a real cost: the hub means a DIFFERENT value on every spoke whose domain doesn't start
 * at 0, so a reader has no way to tell where "nothing" is just by looking at the centre. An
 * all-zeros row would then bow OUTWARD to wherever 0 lands on each axis instead of collapsing
 * to a point at the centre — the opposite of how a radar's most basic case is meant to read.
 *
 * So: any axis whose domain CONTAINS zero (`min <= 0 <= max`) but does not START there
 * (`min !== 0`) gets a marker at `radiusFor(0, domain, R, transform)`. Two axes need none:
 *
 * - `min === 0` — the hub already is zero, nothing to mark.
 * - the domain EXCLUDES zero entirely (`min > 0` or `max < 0`) — there is no honest position
 *   for "zero" ON this spoke at all. `radiusFor` would clamp value `0` to whichever end of
 *   `[0, R]` is nearest, which is exactly the position `domain.min` already occupies — drawing
 *   a "this is zero" marker there would misrepresent `domain.min` as zero, which is worse than
 *   drawing nothing. This module returns `null` for that case rather than a clamped radius.
 *
 * @param {ResolvedAxis[]} axes
 * @param {[number, number][]} domains - aligned with `axes`, from `domainsFor`
 * @param {number} R
 * @param {'linear'|'sqrt'} transform
 * @returns {(number|null)[]} one entry per axis, positionally aligned with `axes`
 */
export function zeroRingFor(axes, domains, R, transform) {
	return axes.map((_, i) => {
		const [min, max] = domains[i]
		const containsZero = min <= 0 && max >= 0
		return containsZero && min !== 0 ? radiusFor(0, domains[i], R, transform) : null
	})
}
