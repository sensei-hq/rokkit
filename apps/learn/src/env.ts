import { defineEnvVars } from '@sveltejs/kit/env'

// Private runtime variables, read via `env` from `$app/env/private`.
// `OPENROUTER_API_KEY` is optional: the /api/chat/interpret endpoint answers
// 503 without it, and the browser falls back to its local reading.
export const variables = defineEnvVars({
	OPENROUTER_API_KEY: {
		schema: (value) => value
	}
})
