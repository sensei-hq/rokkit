/** Format an ISO timestamp as a short relative label ("5m ago"), or a clock time when relative=false. */
export function formatRelativeTime(timestamp: string, relative = true): string {
	const ms = new Date(timestamp).getTime()
	if (Number.isNaN(ms)) return ''
	return relative ? elapsedLabel(Date.now() - ms) : new Date(ms).toLocaleTimeString()
}

/** A short label for an elapsed duration in milliseconds: "just now", "5m ago", "3h ago", "2d ago". */
function elapsedLabel(elapsed: number): string {
	const minutes = Math.round(elapsed / 60000)
	if (minutes < 1) return 'just now'
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.round(minutes / 60)
	return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`
}
