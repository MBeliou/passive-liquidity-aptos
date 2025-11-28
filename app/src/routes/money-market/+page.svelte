<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte';
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { getMarkets } from './money-market.remote';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { MONEY_MARKETS } from './shared';

	const marketsQuery = getMarkets();

	function formatPrice(price: number) {
		return new Intl.NumberFormat(undefined, {
			currency: 'usd',
			minimumFractionDigits: 2,
			style: 'currency'
		}).format(price);
	}

	const percentFormatter = (() => {
		return new Intl.NumberFormat(undefined, {
			style: 'percent',
			minimumFractionDigits: 2
		});
	})();
</script>

<div class="mx-auto max-w-7xl p-4">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Money Markets</h1>
		<p class="text-muted-foreground mt-2">Borrow and Lend on Money Markets</p>
	</div>
</div>

<div class=" flex min-h-screen flex-col px-4">
	{#if marketsQuery.error}
		<div>
			Couldn't fetch markets: {marketsQuery.error}
		</div>
	{:else if marketsQuery.loading}
		<div>
			<Spinner></Spinner>
		</div>
	{:else}
		<ul>
			{#each marketsQuery.current as { name, icon, price, symbol, markets }}
				<li class="flex items-center gap-8 py-4">
					<Avatar.Root class="size-12 border-2">
						<AvatarImage src={icon} class=""></AvatarImage>
						<AvatarFallback class=" bg-gradient-to-b from-blue-300 to-blue-600 font-semibold"
							>{name[0].toUpperCase()}</AvatarFallback
						>
					</Avatar.Root>
					<div class="grid grow gap-4">
						<div class="bg-muted flex items-center space-x-2 rounded-lg p-2">
							<div class="grow">
								<div class="text-xl">
									{name} <span class="text-muted-foreground text-sm">{symbol}</span>
								</div>
								<div class="text-muted-foreground mt-1 text-sm">
									{formatPrice(price)}
								</div>
							</div>

							<!-- 
							<div>
								<Button size="sm" href={marketUrl} target="_blank" variant="outline">
									View Market
									<ArrowUpRight></ArrowUpRight>
								</Button>
							</div>
							 -->
						</div>
						<div class="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
							{#each MONEY_MARKETS as moneyMarket}
								{@const marketDetails = markets[moneyMarket]}

								<div class="grid gap-2 border-r">
									<div class="text-center text-sm capitalize">{moneyMarket}</div>

									{#if marketDetails}
										<div class="grid grid-cols-2 gap-4">
											<div class="text-muted-foreground text-center text-xs font-semibold">
												Provide at
												<span class="text-foreground block text-lg font-medium">
													{percentFormatter.format(marketDetails.supplyApr)}
												</span>
											</div>
											<div class="text-muted-foreground text-center text-xs font-semibold">
												Borrow at
												<span class="text-foreground block text-lg font-medium">
													{percentFormatter.format(marketDetails.borrowApr)}
												</span>
											</div>
										</div>
									{:else}
										<div class="text-muted-foreground text-center text-xs">Market unavailable</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</li>

				<Separator></Separator>
			{/each}
		</ul>
	{/if}
</div>
