<script lang="ts">
	import PoolCard from '$lib/components/app/pool-card/pool-card.svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { getPools } from '$lib/remote/pools.remote';
	import { CTA } from '$lib/components/app/cta';
</script>

<div class="flex justify-between px-4">
	<h1 class="text-3xl font-bold tracking-wide lg:text-5xl">Earn</h1>
</div>
<svelte:boundary>
	{@const pools = await getPools()}
	{@const unusedPools = pools.filter(
		(p) => p.poolDetails.reduce((prev, curr) => prev + curr?.volumeDay, 0) === 0
	)}
	{@const usedPools = pools.filter(
		(p) => p.poolDetails.reduce((prev, curr) => prev + curr?.volumeDay, 0) != 0
	)}

	<div class="mt-12 flex min-h-screen flex-col px-4">
		<div class="grid flex-1 gap-8">
			<section>
				<div>
					<h2 class="text-lg font-semibold">Top Pools Today</h2>
					<p class="text-muted-foreground text-sm">Top concentrated pools for you</p>
				</div>
				<div>
					<ul class="mt-6 grid gap-4 md:grid-cols-2">
						{#each usedPools as pool}
							{@const slug =
								pool.tokenA.symbol.toLowerCase() + '-' + pool.tokenB.symbol.toLowerCase()}

							<li>
								<PoolCard
									tokenA={pool.tokenA}
									tokenB={pool.tokenB}
									poolDetails={pool.poolDetails}
									{slug}
								/>
							</li>
						{/each}
					</ul>
				</div>
			</section>
			<CTA></CTA>
			<section>
				<div>
					<h2 class="text-lg font-semibold">Unused Pools</h2>
					<p class="text-muted-foreground text-sm">There's no trading going on in these pools</p>
				</div>
				<div>
					<ul class="mt-6 grid gap-4 md:grid-cols-2">
						{#each unusedPools as pool}
							{@const slug =
								pool.tokenA.symbol.toLowerCase() + '-' + pool.tokenB.symbol.toLowerCase()}

							<li>
								<PoolCard
									tokenA={pool.tokenA}
									tokenB={pool.tokenB}
									poolDetails={pool.poolDetails}
									{slug}
								/>
							</li>
						{/each}
					</ul>
				</div>
			</section>
		</div>
	</div>

	{#snippet pending()}
		<div class="min-h-screen flex flex-col justify-center items-center">
			<LoaderCircle class="animate-spin"></LoaderCircle>
		</div>
	{/snippet}
</svelte:boundary>
