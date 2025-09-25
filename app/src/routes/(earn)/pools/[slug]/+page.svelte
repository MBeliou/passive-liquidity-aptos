<script lang="ts">
	import { page } from '$app/state';
	import ShareButton from '$lib/components/app/share-button/share-button.svelte';
	import { getAggregatePoolInfo } from './data.remote';
</script>

<div class="flex justify-between">
	<h1 class="text-3xl font-bold tracking-wide">Pool name / assets</h1>
	<div class="flex items-center">
		<ShareButton
			content={{
				title: 'Pool',
				description: 'description',
				url: page.url.toString()
			}}
		></ShareButton>
	</div>
</div>

<section>
	{#await getAggregatePoolInfo(page.params.slug!) then poolsInfo}
		<div>
			{JSON.stringify(poolsInfo)}
		</div>
	{/await}
</section>
