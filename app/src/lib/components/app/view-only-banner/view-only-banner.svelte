<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import Info from "@lucide/svelte/icons/info"
</script>

<Alert.Root class="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
	<Info class="h-4 w-4 text-blue-600" />
	<Alert.Title>View-Only Mode</Alert.Title>
	<Alert.Description>
		You're viewing demo positions for showcase purposes. This feature is currently in testing on
		mainnet and only available to authorized users. Connect with the authorized wallet address to
		manage positions.
	</Alert.Description>
</Alert.Root>
