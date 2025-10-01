<script lang="ts">
	import { page } from '$app/state';
	import LiquidityRepartition from '$lib/components/app/charts/liquidity-repartition/liquidity-repartition.svelte';
	import PoolChart from '$lib/components/app/charts/pool/pool-chart.svelte';
	//import PoolChart from '$lib/components/app/charts/pool/pool-chart.svelte';
	import ShareButton from '$lib/components/app/share-button/share-button.svelte';
	import * as Card from '$lib/components/ui/card';

	let { data } = $props();

	//$inspect(data.liquidity);
</script>

<div class="grid gap-8">
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
			{JSON.stringify(data.about.liquidityDistribution)}
		</div>
		<div class="mt-4">
			<PoolChart chartData={data.liquidity}></PoolChart>
		</div>
	</section>

	<section>
		<div class="grid min-h-[200px] w-full gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>In Range</Card.Title>
					<Card.Description
						>Repartition of liquidity that is close to the current price</Card.Description
					>
				</Card.Header>
				<LiquidityRepartition liquidity={data.about.inRangeLiquidityDistribution}
				></LiquidityRepartition>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Full-Width</Card.Title>
					<Card.Description>Repartition of liquidity through the whole price band</Card.Description>
				</Card.Header>
				<LiquidityRepartition liquidity={data.about.liquidityDistribution}></LiquidityRepartition>
			</Card.Root>
		</div>
	</section>

	<section>
		<div class="grid min-h-[200px] w-full gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>In Range Positions</Card.Title>
					<Card.Description>Count of positions close to the current price</Card.Description>
				</Card.Header>
				<LiquidityRepartition
					liquidity={data.about.inRangePositionCounts}
					valueFormatter={(v) => v.toString()}
				></LiquidityRepartition>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Full-Width Positions</Card.Title>
					<Card.Description>Count of all positions across the price band</Card.Description>
				</Card.Header>
				<LiquidityRepartition
					liquidity={data.about.positionCounts}
					valueFormatter={(v) => v.toString()}
				></LiquidityRepartition>
			</Card.Root>
		</div>
	</section>
</div>
