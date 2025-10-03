<script lang="ts">
	type TokenInfo = {
		id: string;
		symbol: string;
		name: string | null;
		logo: string | null;
		decimals: number;
	};

	type Balance = {
		tokenId: string;
		amount: string;
		token: TokenInfo | null;
	};

	let {
		balances
	}: {
		balances: Balance[];
	} = $props();

	function formatAmount(amount: string, decimals: number): string {
		const value = BigInt(amount);
		const divisor = BigInt(10 ** decimals);
		const whole = value / divisor;
		const remainder = value % divisor;

		if (remainder === BigInt(0)) {
			return whole.toString();
		}

		const decimalStr = remainder.toString().padStart(decimals, '0');
		const trimmed = decimalStr.replace(/0+$/, '');
		return `${whole}.${trimmed}`;
	}
</script>

{#if balances.length === 0}
	<div class="text-muted-foreground py-8 text-center">
		No undeployed funds. Deposits will appear here before being allocated to positions.
	</div>
{:else}
	<div class="space-y-3">
		{#each balances as balance}
			<div class="border-muted flex items-center justify-between rounded-lg border p-4">
				<div class="flex items-center gap-3">
					{#if balance.token?.logo}
						<img src={balance.token.logo} alt={balance.token.symbol} class="h-8 w-8 rounded-full" />
					{:else}
						<div class="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
							<span class="text-muted-foreground text-xs">?</span>
						</div>
					{/if}
					<div>
						<div class="font-medium">{balance.token?.symbol || 'Unknown'}</div>
						{#if balance.token?.name}
							<div class="text-muted-foreground text-sm">{balance.token.name}</div>
						{/if}
					</div>
				</div>
				<div class="text-right">
					<div class="font-medium">
						{formatAmount(balance.amount, balance.token?.decimals || 8)}
					</div>
					<div class="text-muted-foreground text-xs">Available</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
