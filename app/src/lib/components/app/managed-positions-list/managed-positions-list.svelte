<script lang="ts">
	import LogoStack from '$lib/components/app/logo-stack/logo-stack.svelte';
	import TappLogo from '$lib/assets/tapp-logo.png';

	type TokenInfo = {
		logo: string | null;
		name: string;
		symbol: string;
	};

	type ManagedPosition = {
		positionId: string;
		poolId: string;
		tokenA: TokenInfo;
		tokenB: TokenInfo;
		tickLower: number;
		tickUpper: number;
		decimalsA: number;
		decimalsB: number;
		fee: number;
		liquidityValue: string;
		status: string;
	};

	let {
		positions
	}: {
		positions: ManagedPosition[];
		loading?: boolean;
	} = $props();

	function tickToPrice(tick: number, decimalsA: number, decimalsB: number): number {
		const decimalAdjustment = Math.pow(10, decimalsA - decimalsB);
		return Math.pow(1.0001, tick) * decimalAdjustment;
	}

	function formatPrice(price: number): string {
		return price.toFixed(4);
	}

	const percentFormat = new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
</script>

{#if positions.length === 0}
	<div class="text-muted-foreground py-8 text-center">
		No managed positions yet. Deposit funds to create your first position.
	</div>
{:else}
	<div class="space-y-4">
		{#each positions as position}
			{@const lowerPrice = tickToPrice(position.tickLower, position.decimalsA, position.decimalsB)}
			{@const upperPrice = tickToPrice(position.tickUpper, position.decimalsA, position.decimalsB)}
			<div
				class="border-muted flex flex-col items-start justify-between gap-4 rounded-lg border p-4 md:flex-row md:items-center"
			>
				<div class="flex items-center gap-4">
					<LogoStack
						tokenA={{ logo: position.tokenA.logo }}
						tokenB={{ logo: position.tokenB.logo }}
					/>
					<div>
						<div class="flex flex-wrap items-center gap-1 font-medium">
							<img src={TappLogo} alt="Tapp Exchange" class="h-4 w-4" />
							<span class="text-sm md:text-base"
								>{position.tokenA.name} / {position.tokenB.name}</span
							>
							<span class="text-muted-foreground text-xs"
								>• {percentFormat.format(position.fee / 100)}</span
							>
						</div>
						<div class="text-muted-foreground text-sm">
							{position.tokenA.symbol} / {position.tokenB.symbol}
						</div>
						<div class="text-muted-foreground text-xs">
							Range: {formatPrice(lowerPrice)} - {formatPrice(upperPrice)}
						</div>
					</div>
				</div>
				<div class="text-left md:text-right">
					<div class="font-semibold">{position.liquidityValue}</div>
					<div class="text-muted-foreground text-xs">Liquidity</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
