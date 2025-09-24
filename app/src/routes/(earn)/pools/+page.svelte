<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { getPools } from './data.remote';

	const feeTiers = [0.01, 0.05, 0.3, 1];

	const percentFormat = new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
</script>

<section class=" px-4 pt-24">
	<h2 class="border-b pb-1 text-2xl font-semibold">Pools</h2>
	<ul class="mt-6 grid grid-cols-2 gap-4">
		{#each await getPools() as pool}
			{@const slug = pool.tokenA.symbol.toLowerCase() + '-' + pool.tokenB.symbol.toLowerCase()}
			<!-- TODO: also add slug -->
			<li>
				<a class="hover:border-primary grid gap-6 rounded border" href="/pools/{slug}">
					<div class="flex items-center gap-4 p-4">
						<div class="relative">
							<div
								class="size-8 rounded-full border bg-cover bg-center"
								style="background-image: url({pool.tokenA.logo});"
							></div>
							<div
								class="absolute inset-y-0 left-4 top-2 size-8 rounded-full border bg-cover bg-center"
								style="background-image: url({pool.tokenB.logo});"
							></div>
						</div>
						<div>
							<h2>
								<div>
									{pool.tokenA.name} ({pool.tokenA.symbol}) - {pool.tokenB.name} ({pool.tokenB
										.symbol})
								</div>
							</h2>
						</div>
					</div>

					<div class="flex items-center border-t">
						{#each feeTiers as feeTier}
							{@const hasTier = pool.uniqueFees.map((f) => parseFloat(f)).includes(feeTier)}
							<div
								class={[
									'flex flex-grow flex-col items-center justify-center border-r p-2 font-medium'
								]}
							>
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
</section>
