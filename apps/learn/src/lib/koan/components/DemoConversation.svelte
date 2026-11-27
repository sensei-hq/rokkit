<script lang="ts">
	import { ChatStream, ChatMessage } from '#lib/chat/index.js'
	import type { DemoMeta } from '#lib/koan/types.js'

	/**
	 * The conversation for a demo with no hand-written one: the user's ask, then a reply
	 * from the demo's catalog entry saying what is on the canvas. Without it those demos
	 * left the pane blank under its header (#224).
	 */
	interface Props {
		meta: DemoMeta
		/** The ask that opened the demo; falls back to the demo's title. */
		query?: string
	}

	const { meta, query = '' }: Props = $props()
</script>

<ChatStream>
	<ChatMessage kind="user" ago="2m" icon="i-mdi:chat-outline">
		{query || `Show me ${meta.title}`}
	</ChatMessage>
	<ChatMessage kind="info" status="mounted" ago="just now" icon="i-mdi:layers-outline">
		<strong>{meta.title}</strong> is on the canvas. {meta.description}
	</ChatMessage>
</ChatStream>
