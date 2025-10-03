<script lang="ts">
	import { FEE_TIERS } from '$lib/components/app/charts/pool/utils';
	import LogoStack from '$lib/components/app/logo-stack/logo-stack.svelte';
	import X from '@lucide/svelte/icons/x';

	type TokenInfo = {
		id: string;
		symbol: string;
		name: string | null;
		logo: string | null;
		decimals: number;
	};

	let {
		tokenA,
		tokenB,
		uniqueFees,
		slug,
		volume = 0
	}: {
		tokenA: TokenInfo;
		tokenB: TokenInfo;
		uniqueFees: string[];
		slug: string;
		volume: number;
	} = $props();

	const percentFormat = new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
</script>

<a
	class="hover:border-primary grid grid-rows-1 gap-6 rounded border duration-200"
	href="/pools/{slug}"
>
	<div class="flex items-center gap-4 p-4">
		<LogoStack tokenA={{ logo: tokenA.logo }} tokenB={{ logo: tokenB.logo }}></LogoStack>
		<div>
			<h2>
				<div>
					{tokenA.name} ({tokenA.symbol}) - {tokenB.name} ({tokenB.symbol})
				</div>
			</h2>
		</div>
	</div>

	<div class="flex h-full flex-grow items-stretch border-t">
		{#each FEE_TIERS as feeTier}
			{@const hasTier = uniqueFees.map((f) => parseFloat(f)).includes(parseFloat(feeTier))}
			<div class="flex flex-grow flex-col items-center justify-stretch border-r p-2 font-medium">
				<!-- TODO: if high volume -> ⽕ else ⽶ -->
				<div class="flex-grow">
					{#if hasTier}
						{#if volume === 0}
							<span class="text-sm">❄️</span>
						{:else}
							{volume}
						{/if}
					{:else}
						<X size={16} class="text-muted-foreground"></X>
					{/if}
				</div>
				<div class="text-muted-foreground text-xs">
					{percentFormat.format(feeTier / 100)}
				</div>
			</div>
		{/each}
	</div>
</a>
