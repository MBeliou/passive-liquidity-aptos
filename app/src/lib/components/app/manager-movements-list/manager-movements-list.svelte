<script lang="ts">
	import TappLogo from '$lib/assets/tapp-logo.png';
	import ArrowDownToLine from '@lucide/svelte/icons/arrow-down-to-line';
	import ArrowUpFromLine from '@lucide/svelte/icons/arrow-up-to-line';
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';

	type PoolInfo = {
		tokenA: string;
		tokenB: string;
		fee: number;
	};

	type Movement = {
		id: string;
		type: 'deposit' | 'rebalance' | 'withdraw';
		timestamp: Date;
		txHash: string;
		// For deposits/withdrawals
		amount?: string;
		tokenSymbol?: string;
		// For rebalances
		fromPool?: PoolInfo;
		toPool?: PoolInfo;
		amountMoved?: string;
	};

	let {
		movements
	}: {
		movements: Movement[];
	} = $props();

	function formatRelativeTime(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	}

	function getMovementColor(type: Movement['type']): string {
		switch (type) {
			case 'deposit':
				return 'text-green-600';
			case 'withdraw':
				return 'text-red-600';
			case 'rebalance':
				return 'text-blue-600';
		}
	}

	function getMovementIcon(type: Movement['type']) {
		switch (type) {
			case 'deposit':
				return ArrowDownToLine;
			case 'withdraw':
				return ArrowUpFromLine;
			case 'rebalance':
				return ArrowRightLeft;
		}
	}

	function getMovementLabel(type: Movement['type']): string {
		switch (type) {
			case 'deposit':
				return 'Deposit';
			case 'withdraw':
				return 'Withdrawal';
			case 'rebalance':
				return 'Rebalance';
		}
	}

	const percentFormat = new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	function getTxExplorerUrl(txHash: string): string {
		return `https://explorer.aptoslabs.com/txn/${txHash}?network=mainnet`;
	}
</script>

{#if movements.length === 0}
	<div class="text-muted-foreground py-8 text-center">
		No movements yet. Deposits and rebalances will appear here.
	</div>
{:else}
	<div class="space-y-3">
		{#each movements as movement}
			{@const Icon = getMovementIcon(movement.type)}
			{@const color = getMovementColor(movement.type)}
			<div
				class="border-muted flex flex-col items-start justify-between gap-3 rounded-lg border p-4 md:flex-row md:items-center"
			>
				<div class="flex items-start gap-4">
					<div class={`mt-0.5 ${color}`}>
						<Icon size={20} />
					</div>
					<div class="flex-1">
						<div class="flex items-center gap-2 font-medium">
							<span>{getMovementLabel(movement.type)}</span>
							<span class="text-muted-foreground text-xs"
								>{formatRelativeTime(movement.timestamp)}</span
							>
						</div>

						{#if movement.type === 'deposit' || movement.type === 'withdraw'}
							<div class="text-muted-foreground text-sm">
								{movement.amount}
								{movement.tokenSymbol}
							</div>
						{:else if movement.type === 'rebalance' && movement.fromPool && movement.toPool}
							<div class="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
								<div class="flex items-center gap-1">
									<img src={TappLogo} alt="Tapp" class="h-3 w-3" />
									<span>{movement.fromPool.tokenA}/{movement.fromPool.tokenB}</span>
									<span class="text-xs">{percentFormat.format(movement.fromPool.fee / 100)}</span>
								</div>
								<span>→</span>
								<div class="flex items-center gap-1">
									<img src={TappLogo} alt="Tapp" class="h-3 w-3" />
									<span>{movement.toPool.tokenA}/{movement.toPool.tokenB}</span>
									<span class="text-xs">{percentFormat.format(movement.toPool.fee / 100)}</span>
								</div>
							</div>
							{#if movement.amountMoved}
								<div class="text-muted-foreground text-xs">
									Amount: {movement.amountMoved}
								</div>
							{/if}
						{/if}

						<a
							href={getTxExplorerUrl(movement.txHash)}
							target="_blank"
							rel="noopener noreferrer"
							class="text-muted-foreground hover:text-foreground text-xs underline"
						>
							View transaction
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
