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

	type PoolDetail = {
		id: string;
		fee: string;
		dex: string;
		positionIndex: number;
		tradingAPR: number;
		bonusAPR: number;
		tvl: number;
		volumeDay: number;
		updatedAt: Date;
	};

	let {
		tokenA,
		tokenB,
		poolDetails,
		slug
	}: {
		tokenA: TokenInfo;
		tokenB: TokenInfo;
		poolDetails: PoolDetail[];
		slug: string;
	} = $props();

	const percentFormat = new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	const compactFormat = new Intl.NumberFormat(undefined, {
		notation: 'compact',
		maximumFractionDigits: 2
	});

	// Create a map of fee tier to pool details for quick lookup
	const poolDetailsByFee = $derived(
		poolDetails.reduce(
			(acc, pool) => {
				acc[pool.fee] = pool;
				return acc;
			},
			{} as Record<string, PoolDetail>
		)
	);

	// Calculate aggregate stats
	const totalVolume = $derived(poolDetails.reduce((sum, pool) => sum + pool.volumeDay, 0));
	const totalTVL = $derived(poolDetails.reduce((sum, pool) => sum + pool.tvl, 0));

	const aprValues = $derived(
		poolDetails.map((pool) => pool.tradingAPR + pool.bonusAPR).filter((apr) => apr > 0)
	);
	const minAPR = $derived(aprValues.length > 0 ? Math.min(...aprValues) : 0);
	const maxAPR = $derived(aprValues.length > 0 ? Math.max(...aprValues) : 0);
</script>

<a class="hover:border-primary hover:bg-muted/60  grid grid-rows-1 rounded border duration-200" href="/pools/{slug}">
	<div class="flex items-center gap-6 p-4">
		<LogoStack tokenA={{ logo: tokenA.logo }} tokenB={{ logo: tokenB.logo }}></LogoStack>
		<div class="flex-1">
			<h2 class="font-semibold">
				{tokenA.name} / {tokenB.name}
			</h2>
			<div class="text-muted-foreground text-sm">
				{tokenA.symbol} / {tokenB.symbol}
			</div>
		</div>
	</div>

	<div class="border-t px-4 py-3">
		<div class="flex justify-evenly gap-4 text-right text-sm">
			<div>
				<div class="text-muted-foreground text-xs">Volume (24h)</div>
				<div class="font-medium">${compactFormat.format(totalVolume)}</div>
			</div>
			<div>
				<div class="text-muted-foreground text-xs">TVL</div>
				<div class="font-medium">${compactFormat.format(totalTVL)}</div>
			</div>
			<div>
				<div class="text-muted-foreground text-xs">APR Range</div>
				<div class="font-medium">
					{#if minAPR === maxAPR}
						{minAPR.toFixed(2)}%
					{:else}
						{minAPR.toFixed(2)}% - {maxAPR.toFixed(2)}%
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="flex h-full flex-grow items-stretch border-t">
		{#each FEE_TIERS as feeTier}
			{@const poolDetail = poolDetailsByFee[feeTier]}
			{@const hasTier = !!poolDetail}
			<div class="flex flex-grow flex-col items-center justify-center border-r p-2 text-center">
				{#if hasTier}
					<div class="text-xs font-medium">
						${compactFormat.format(poolDetail.volumeDay)}
					</div>
					<div class="text-muted-foreground text-xs">
						{(poolDetail.tradingAPR + poolDetail.bonusAPR).toFixed(1)}% APR
					</div>
				{:else}
					<X size={16} class="text-muted-foreground"></X>
				{/if}
				<div class="text-muted-foreground mt-1 text-xs">
					{percentFormat.format(parseFloat(feeTier) / 100)}
				</div>
			</div>
		{/each}
	</div>
</a>
