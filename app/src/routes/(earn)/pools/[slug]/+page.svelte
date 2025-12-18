<script lang="ts">
	import { page } from '$app/state';
	import LiquidityRepartition from '$lib/components/app/charts/liquidity-repartition/liquidity-repartition.svelte';
	import PoolChart from '$lib/components/app/charts/pool/pool-chart.svelte';
	import PriceChart from '$lib/components/app/charts/price/price-chart.svelte';
	import * as Card from '$lib/components/ui/card';

	import LogoStack from '$lib/components/app/logo-stack/logo-stack.svelte';
	import { getTabBarState } from '$lib/components/app/tab-bar/tab-bar-state.svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import Button from '$lib/components/ui/button/button.svelte';
	import Clipboard from '@lucide/svelte/icons/clipboard';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { toast } from 'svelte-sonner';
	import RefreshButton from '$lib/components/app/refresh-button/refresh-button.svelte';

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

	// Calculate current price and 7-day change
	const currentPrice = $derived.by(() => {
		if (displayPrices.length === 0) return 0;
		return parseFloat(displayPrices[displayPrices.length - 1].y);
	});

	const priceChange7d = $derived.by(() => {
		if (displayPrices.length < 2) return 0;
		const firstPrice = parseFloat(displayPrices[0].y);
		const lastPrice = parseFloat(displayPrices[displayPrices.length - 1].y);
		if (firstPrice === 0) return 0;
		return ((lastPrice - firstPrice) / firstPrice) * 100;
	});

	const tokenPairDisplay = $derived(
		pricedInToken === 'A'
			? `${data.assets.tokenB.symbol}/${data.assets.tokenA.symbol}`
			: `${data.assets.tokenA.symbol}/${data.assets.tokenB.symbol}`
	);

	const orderedPools = $derived.by(() => {
		const sorted = [...data.pools]
			.map((s) => {
				return {
					...s,
					fee: parseFloat(s.fee)
				};
			})
			.sort((a, b) => a.fee - b.fee);

		return sorted;
	});

	const percentFormat = new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	const compactFormat = new Intl.NumberFormat(undefined, {
		notation: 'compact',
		maximumFractionDigits: 2
	});

	// Create a map of fee tier to pool for quick lookup
	const poolsByFee = $derived(
		data.pools.reduce(
			(acc, pool) => {
				acc[pool.fee] = pool;
				return acc;
			},
			{} as Record<string, (typeof data.pools)[number]>
		)
	);

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

	async function refreshPools() {
		// We're iterating on the various pools, not the "aggregate"
		// We don't need to wait, we're just asking for a refresh
		data.pools
			.map((p) => p.id)
			.forEach((id) => {
				fetch(`/api/v0/pools/${'tapp'}/${id}/refresh`, {
					method: 'POST'
				});

				fetch(`/api/v0/pools/${'tapp'}/${id}/positions/refresh`, {
					method: 'POST'
				});
			});
	}
</script>

<div class="grid gap-8 [&>*]:px-2 xl:[&>*]:px-0">
	<div
		class="to-muted/20 px-6! grid gap-4 rounded-b-xl border-x border-b bg-gradient-to-b py-8 md:pt-24"
	>
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
			<div>
				<RefreshButton
					onclick={() => {
						refreshPools();
					}}
				></RefreshButton>
			</div>
		</div>

		<div class="">
			<div class="grid gap-4 text-sm md:grid-cols-4">
				<div>
					<div class="text-muted-foreground text-xs">Volume (24h)</div>
					<div class="font-medium">
						${compactFormat.format(data.poolMetrics.totalVolume)}
						{#if data.poolMetrics.volumeChange !== 0}
							<span class={data.poolMetrics.volumeChange > 0 ? 'text-green-500' : 'text-red-500'}>
								{data.poolMetrics.volumeChange > 0
									? '+'
									: ''}{data.poolMetrics.volumeChange.toFixed(1)}%
							</span>
						{/if}
					</div>
				</div>
				<div>
					<div class="text-muted-foreground text-xs">TVL</div>
					<div class="font-medium">${compactFormat.format(data.poolMetrics.totalTVL)}</div>
				</div>
				<div>
					<div class="text-muted-foreground text-xs">APR Range</div>
					<div class="font-medium">
						{#if data.poolMetrics.minAPR === data.poolMetrics.maxAPR}
							{data.poolMetrics.minAPR.toFixed(2)}%
						{:else}
							{data.poolMetrics.minAPR.toFixed(2)}% - {data.poolMetrics.maxAPR.toFixed(2)}%
						{/if}
					</div>
					<div class="text-muted-foreground text-xs">
						Trading: {data.poolMetrics.minTradingAPR.toFixed(
							1
						)}-{data.poolMetrics.maxTradingAPR.toFixed(1)}%
						{#if data.poolMetrics.maxBonusAPR > 0}
							· Bonus: up to {data.poolMetrics.maxBonusAPR.toFixed(1)}%
						{/if}
					</div>
				</div>
				<div>
					<div class="text-muted-foreground text-xs">Liquidity In Range</div>
					<div class="font-medium">{data.poolMetrics.usedLiquidityPercent.toFixed(1)}%</div>
				</div>
			</div>
		</div>

		<div class="bg-muted/30 p-4">
			<h3 class="mb-2 font-semibold">Overall Pool Performance</h3>
			<div class="grid grid-cols-2 gap-6 text-sm md:grid-cols-3">
				<div>
					<div class="text-muted-foreground text-xs">Total Fees Captured (24h)</div>
					<div class="text-xl font-semibold">
						${compactFormat.format(data.poolMetrics.totalFeesAggregate)}
					</div>
				</div>
				<div>
					<div class="text-muted-foreground text-xs">Trading APR (All Liquidity)</div>
					<div class="text-xl font-semibold">
						{#if data.poolMetrics.aggregateTradingAPR > 0}
							{data.poolMetrics.aggregateTradingAPR.toFixed(2)}%
						{:else}
							<span class="text-muted-foreground">-</span>
						{/if}
					</div>
				</div>
				<div>
					<div class="text-muted-foreground text-xs">In-Range Trading APR</div>
					<div class="text-xl font-semibold">
						{#if data.poolMetrics.aggregateInRangeAPR > 0}
							{data.poolMetrics.aggregateInRangeAPR.toFixed(2)}%
							{@const difference =
								data.poolMetrics.aggregateInRangeAPR - data.poolMetrics.aggregateTradingAPR}
							{#if difference > 0}
								<span class="text-xs text-green-500">
									(+{difference.toFixed(2)}% higher)
								</span>
							{/if}
						{:else}
							<span class="text-muted-foreground">-</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="flex items-center justify-end">
			<Button variant="secondary" href="#" disabled
				>Manage my liquidity
				<ArrowUpRight></ArrowUpRight>
			</Button>
		</div>
	</div>
	<section class="grid gap-6">
		<Card.Root>
			<Card.Header>
				<div>
					<h2 class="font-semibold md:text-lg">{tokenPairDisplay}</h2>
					<div class="mt-0 items-baseline gap-2 md:flex">
						<span class="font-bold md:text-2xl">${currentPrice.toFixed(6)}</span>
						<div class="md:inline-block">
							{#if priceChange7d !== 0}
								<span class={priceChange7d > 0 ? 'text-green-500' : 'text-red-500'}>
									{priceChange7d > 0 ? '+' : ''}{priceChange7d.toFixed(2)}% (7d)
								</span>
							{:else}
								<span class="text-muted-foreground">0% (7d)</span>
							{/if}
						</div>
					</div>
				</div>

				<Card.Action>
					<div class="flex items-center gap-2">
						<span class="text-muted-foreground text-sm">Priced in:</span>
						<ToggleGroup.Root type="single" variant="outline" bind:value={pricedInToken}>
							<ToggleGroup.Item value="A" class="px-3 py-1">
								{data.assets.tokenA.symbol}
							</ToggleGroup.Item>
							<ToggleGroup.Item value="B" class="px-3 py-1">
								{data.assets.tokenB.symbol}
							</ToggleGroup.Item>
						</ToggleGroup.Root>
					</div>
				</Card.Action>
			</Card.Header>
			<Card.Content class="mt-4 px-4 pl-16">
				<PriceChart data={displayPrices} tokenSymbol={priceTokenSymbol}></PriceChart>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Liquidity Distribution</Card.Title>
				<Card.Description>
					How liquidity is distributed around the current price point between pools
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<PoolChart chartData={data.liquidity}></PoolChart>
			</Card.Content>
		</Card.Root>
	</section>

	<section class="grid gap-4">
		<div>
			<h2 class="text-xl font-semibold">Deep Dive</h2>
			<p class="text-muted-foreground text-sm">
				Deep dive into liquidity and returns, per fee tier
			</p>
		</div>
		<div class="grid gap-6 lg:grid-cols-3 lg:grid-rows-1">
			<Card.Root>
				<Card.Header>
					<Card.Title>Volatility Analysis</Card.Title>
					<Card.Description>{data.volatility.insight}</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-1 grid-rows-3 gap-4">
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
			<Card.Root class="lg:col-span-2">
				<Card.Header>
					<Card.Title>Pool fee info</Card.Title>
					<Card.Description>info per fee tier</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid gap-4 md:grid-cols-2">
						{#each orderedPools as pool}
							<div class="rounded-lg border p-4">
								<div class="mb-3 flex items-center justify-between">
									<h3 class="text-lg font-semibold">
										{percentFormat.format(pool.fee / 100)} Fee Pool
									</h3>
									{#if pool.bonusAPR > 0}
										<span class="text-primary text-sm">⭐ Bonus</span>
									{/if}
								</div>

								<div class="grid grid-cols-2 gap-4 text-sm">
									<div>
										<div class="text-muted-foreground text-xs">Volume (24h)</div>
										<div class="font-medium">
											${compactFormat.format(pool.volumeDay)}
											{#if pool.volumeChangePercent !== 0}
												<span
													class={pool.volumeChangePercent > 0 ? 'text-green-500' : 'text-red-500'}
												>
													{pool.volumeChangePercent > 0
														? '+'
														: ''}{pool.volumeChangePercent.toFixed(1)}%
												</span>
											{/if}
										</div>
									</div>
									<div>
										<div class="text-muted-foreground text-xs">TVL</div>
										<div class="font-medium">${compactFormat.format(pool.tvl)}</div>
										<div class="text-muted-foreground text-xs">
											${compactFormat.format(pool.inRangeTVL)} in range
										</div>
									</div>
									<div>
										<div class="text-muted-foreground text-xs">Trading APR</div>
										<div class="font-medium">{pool.tradingAPR.toFixed(2)}%</div>
										<div class="font-medium">
											{#if pool.inRangeAPR > 0}
												{pool.inRangeAPR.toFixed(2)}% in range APR
											{:else}
												<span class="text-muted-foreground">-</span>
											{/if}
										</div>
									</div>

									<div>
										<div class="text-muted-foreground text-xs">Total Fees (24h)</div>
										<div class="font-medium">${compactFormat.format(pool.totalFees)}</div>
									</div>
									<div>
										<div class="text-muted-foreground text-xs">Bonus APR</div>
										<div class="font-medium">
											{#if pool.bonusAPR > 0}
												<span class="text-primary">{pool.bonusAPR.toFixed(2)}%</span>
											{:else}
												<span class="text-muted-foreground">None</span>
											{/if}
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
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

	<section>
		<Card.Root>
			<Card.Header>
				<Card.Title>Pool Addresses</Card.Title>
				<Card.Description>Contract addresses for each fee tier pool</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-3">
					{#each orderedPools as pool}
						<div class="flex items-center justify-between border-b pb-3 last:border-b-0">
							<div class="flex-1">
								<div class="font-medium">{percentFormat.format(pool.fee / 100)} Fee Pool</div>
								<div class="text-muted-foreground mt-1 break-all font-mono text-xs">
									{pool.id}
								</div>
							</div>
							<Button
								size="sm"
								variant="secondary"
								onclick={() => {
									navigator.clipboard.writeText(pool.id);
									toast(`Copied ${pool.fee}% pool address`);
								}}
							>
								<Clipboard></Clipboard>
							</Button>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</section>
</div>
