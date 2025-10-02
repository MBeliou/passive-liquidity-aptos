<script lang="ts">
	import { page } from '$app/state';
	import LiquidityRepartition from '$lib/components/app/charts/liquidity-repartition/liquidity-repartition.svelte';
	import PoolChart from '$lib/components/app/charts/pool/pool-chart.svelte';
	import PriceChart from '$lib/components/app/charts/price/price-chart.svelte';
	import * as Card from '$lib/components/ui/card';

	import TappLogo from '$lib/assets/tapp-logo.png';
	import { FEE_TIERS } from '$lib/components/app/charts/pool/utils.js';
	import LogoStack from '$lib/components/app/logo-stack/logo-stack.svelte';
	import { getTabBarState } from '$lib/components/app/tab-bar/tab-bar-state.svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';

	let { data } = $props();

	const tabBarState = getTabBarState();

	let pricedInToken = $state<'A' | 'B'>('B');

	const displayPrices = $derived.by(() => {
		if (pricedInToken === 'A') {
			// Invert prices to show how many A per B
			return data.prices.map((p) => ({
				x: p.x,
				y: (1 / parseFloat(p.y)).toString()
			}));
		}
		return data.prices;
	});

	const priceTokenSymbol = $derived(
		pricedInToken === 'A' ? data.assets.tokenA.symbol : data.assets.tokenB.symbol
	);

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

		tabBarState.setBackButton('/');

		return () => {
			tabBarState.clearShareButton();
			tabBarState.clearBackButton();
		};
	});
</script>

<div class="grid gap-8 [&>*]:px-6">
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
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Price Chart</h2>
				<div class="flex items-center gap-2">
					<span class="text-muted-foreground text-sm">Priced in:</span>
					<ToggleGroup.Root type="single" class="border" bind:value={pricedInToken}>
						<ToggleGroup.Item value="A" class="px-3 py-1">
							{data.assets.tokenA.symbol}
						</ToggleGroup.Item>
						<ToggleGroup.Item value="B" class="px-3 py-1">
							{data.assets.tokenB.symbol}
						</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>
			</div>
			<PriceChart data={displayPrices} tokenSymbol={priceTokenSymbol}></PriceChart>

			<div class="mt-4">
				<Card.Root>
					<Card.Header>
						<Card.Title>Volatility Analysis</Card.Title>
						<Card.Description>{data.volatility.insight}</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="grid grid-cols-3 gap-4">
							<div>
								<div class="text-muted-foreground text-xs uppercase tracking-wide">Week</div>
								<div class="text-2xl font-semibold">{data.volatility.week.toFixed(1)}%</div>
							</div>
							<div>
								<div class="text-muted-foreground text-xs uppercase tracking-wide">Day</div>
								<div class="text-2xl font-semibold">{data.volatility.day.toFixed(1)}%</div>
							</div>
							<div>
								<div class="text-muted-foreground text-xs uppercase tracking-wide">Recent</div>
								<div class="text-2xl font-semibold">{data.volatility.hour.toFixed(1)}%</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</section>

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
