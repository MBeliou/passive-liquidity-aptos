<script lang="ts">
	import { page } from '$app/state';
	import PoolChart from '$lib/components/app/charts/pool/pool-chart.svelte';
	//import PoolChart from '$lib/components/app/charts/pool/pool-chart.svelte';
	import ShareButton from '$lib/components/app/share-button/share-button.svelte';

	let { data } = $props();

	$inspect(data.liquidity)
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
	<div>
		{JSON.stringify(data.pools)}
	</div>
	<div class="mt-4">
		<PoolChart chartData={data.liquidity}></PoolChart> 
	</div>
</section>
