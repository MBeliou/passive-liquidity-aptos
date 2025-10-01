<script lang="ts">
	import { page } from '$app/state';
	import LiquidityRepartition from '$lib/components/app/charts/liquidity-repartition/liquidity-repartition.svelte';
	import PoolChart from '$lib/components/app/charts/pool/pool-chart.svelte';
	import * as Card from '$lib/components/ui/card';

	import TappLogo from '$lib/assets/tapp-logo.png';
	import { FEE_TIERS } from '$lib/components/app/charts/pool/utils.js';
	import LogoStack from '$lib/components/app/logo-stack/logo-stack.svelte';
	import { getTabBarState } from '$lib/components/app/tab-bar/tab-bar-state.svelte';

	let { data } = $props();

	const tabBarState = getTabBarState();

	const tappPools = $derived.by(() => {
		const sorted = data.pools
			.sort((a, b) => parseInt(a.fee) - parseInt(b.fee))
			.map((s) => parseFloat(s.fee));
		return sorted;
	});

	const percentFormat = new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	$effect(() => {
		// TODO: we want an actual title and description here
		tabBarState.setShareButton({
			title: 'Pool',
			description: 'description',
			url: page.url.toString()
		});

		return () => {
			tabBarState.clearShareButton();
		};
	});
</script>

<div class="grid gap-8">
	<div class="to-muted/20 grid gap-4 rounded-b-xl border-b bg-gradient-to-b py-12 md:pt-24">
		<div class="flex justify-between">
			<div class="flex items-center space-x-8">
				<div>
					<LogoStack
						tokenA={{ logo: data.assets.tokenA.logo }}
						tokenB={{ logo: data.assets.tokenB.logo }}
					></LogoStack>
				</div>
				<div>
					<h1 class="text-3xl font-bold tracking-wide">
						{data.assets.tokenA.name} / {data.assets.tokenB.name}
					</h1>
					<div class="text-muted-foreground text-sm font-semibold">
						{data.assets.tokenA.symbol} / {data.assets.tokenB.symbol}
					</div>
				</div>
			</div>
		</div>
		<div class="grid md:grid-cols-2">
			<div class="">
				<div class="flex items-center">
					<img src={TappLogo} alt="Tapp Exchange Logo" class="w-12" />
					<h2 class=" font-medium">Tapp Exchange Pools</h2>
				</div>
				<div class="flex items-center">
					<!-- 
						{#each FEE_TIERS as feeTier}
						{@const isAvailableOnTapp = tappPools.includes(parseFloat(feeTier))}
						<div class={['', isAvailableOnTapp && 'bg-red-500']}>
							{feeTier}
						</div>
						{/each}
						-->
					<div class="flex items-center border-l border-t">
						{#each FEE_TIERS as feeTier}
							{@const hasTier = tappPools.includes(parseFloat(feeTier))}
							<div
								class={[
									'flex flex-grow flex-col items-center justify-center border-r p-2 font-medium'
								]}
							>
								<!-- TODO: if high volume -> ⽕ else ⽶ -->
								<div class="">{hasTier ? 'volume' : '-'}</div>
								<div class="text-muted-foreground text-xs">
									{percentFormat.format(feeTier / 100)}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>

	<section>
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
