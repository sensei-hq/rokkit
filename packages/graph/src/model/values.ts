import { readPath } from './path.js'
import type { RowBadge } from '../types.js'

/** The order a row's badges are shown in. */
export const BADGE_ORDER: RowBadge[] = ['pk', 'fk', 'uq', 'nn']

/** A string, or nothing. */
export function str(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined
}

/** A finite number, or nothing. NaN and Infinity are not measures. */
export function num(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/** The value at the mapped `path`, or at the canonical key when the map omits it. */
export function pick(row: unknown, path: string | undefined, fallbackKey: string): unknown {
	return readPath(row, path ?? fallbackKey)
}
