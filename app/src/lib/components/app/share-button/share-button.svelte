<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import ShareIcon from '@lucide/svelte/icons/share-2';

	let {
		content,
		cb
	}: {
		content?: Partial<{ title: string; description: string } & { url?: string }>;
		cb?: VoidFunction;
	} = $props();

	async function onShare() {
		try {
			await navigator.share({
				url: content?.url || page.url.toString(),
				title: content?.title,
				text: content?.description
			});
		} catch (error) {
		} finally {
			cb?.();
		}
	}
</script>

<Button size="icon" variant="ghost" class="rounded-full" onclick={() => onShare()}>
	<ShareIcon class="h-5 w-5" />
</Button>
