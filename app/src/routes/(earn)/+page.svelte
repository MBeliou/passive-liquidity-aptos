<script lang="ts">
	import { FEE_TIERS } from '$lib/components/app/charts/pool/utils';
	import LogoStack from '$lib/components/app/logo-stack/logo-stack.svelte';
	import { getPools } from './pools/pools.remote';

	const percentFormat = new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
</script>

<div class="flex justify-between px-4">
	<h1 class="text-3xl font-bold tracking-wide lg:text-5xl">Earn</h1>
</div>
<svelte:boundary>
	<div class="mt-12 flex min-h-screen flex-col px-4">
		<div class="flex-1">
			<section>
				<div>
					<h2 class="text-lg font-semibold">Top Pools</h2>
					<p class="text-muted-foreground text-sm">Top concentrated pools for you</p>
				</div>
				<div>
					<ul class="mt-6 grid gap-4 md:grid-cols-2">
						{#each await getPools() as pool}
							{@const slug =
								pool.tokenA.symbol.toLowerCase() + '-' + pool.tokenB.symbol.toLowerCase()}
							<li>
								<a
									class="hover:border-primary grid gap-6 rounded border duration-200"
									href="/pools/{slug}"
								>
									<div class="flex items-center gap-4 p-4">
										<LogoStack
											tokenA={{ logo: pool.tokenA.logo }}
											tokenB={{ logo: pool.tokenB.logo }}
										></LogoStack>
										<div>
											<h2>
												<div>
													{pool.tokenA.name} ({pool.tokenA.symbol}) - {pool.tokenB.name} ({pool
														.tokenB.symbol})
												</div>
											</h2>
										</div>
									</div>

									<div class="flex items-center border-t">
										{#each FEE_TIERS as feeTier}
											{@const hasTier = pool.uniqueFees
												.map((f) => parseFloat(f))
												.includes(parseFloat(feeTier))}
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
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</section>
		</div>
	</div>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>
