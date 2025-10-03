<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { getUser } from '$lib/user/user-state.svelte';
	import ManagedPositionsList from '$lib/components/app/managed-positions-list/managed-positions-list.svelte';
	import ManagerBalancesList from '$lib/components/app/manager-balances-list/manager-balances-list.svelte';
	import ViewOnlyBanner from '$lib/components/app/view-only-banner/view-only-banner.svelte';
	import { getManagedBalances } from './manager.remote';

	let { data } = $props();

	const userState = getUser();

	// Fetch managed balances
	let balancesPromise = $derived(
		userState.account && userState.displayAddress
			? getManagedBalances({
					userAddress: userState.displayAddress,
					requestingUserAddress: userState.account.address.toString()
				})
			: Promise.resolve({ balances: [], isViewOnly: true })
	);

	let balances = $state<any[]>([]);
	let loadingBalances = $state(false);

	$effect(() => {
		loadingBalances = true;
		balancesPromise.then((result) => {
			balances = result.balances;
			loadingBalances = false;
		});
	});
</script>

<div class="mx-auto max-w-7xl p-4">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Profile</h1>
		<p class="text-muted-foreground mt-2">Manage your automated liquidity positions</p>
	</div>

	<div class="grid gap-6">
		{#if !userState.isAuthorized}
			<ViewOnlyBanner />
		{/if}

		<Card.Root>
			<Card.Header>
				<Card.Title>Available Funds</Card.Title>
				<Card.Description>
					Deposited funds awaiting deployment to liquidity positions
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<ManagerBalancesList balances={balances} loading={loadingBalances} />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title>Managed Positions</Card.Title>
						<Card.Description>
							Automated liquidity positions managed by the protocol
						</Card.Description>
					</div>
					<Button
						onclick={() => userState.triggerRebalance()}
						disabled={userState.loadingManagedPositions || !userState.isAuthorized}
					>
						{#if !userState.isAuthorized}
							View Only
						{:else if userState.loadingManagedPositions}
							Processing...
						{:else}
							Trigger Rebalance
						{/if}
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				<ManagedPositionsList
					positions={userState.managedPositions}
					loading={userState.loadingManagedPositions}
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>How It Works</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div>
					<h3 class="mb-2 font-medium">1. Deposit Funds</h3>
					<p class="text-muted-foreground text-sm">
						Deposit your tokens to receive a dedicated managed address
					</p>
				</div>
				<div>
					<h3 class="mb-2 font-medium">2. Automated Positioning</h3>
					<p class="text-muted-foreground text-sm">
						The protocol creates optimized liquidity positions based on market conditions
					</p>
				</div>
				<div>
					<h3 class="mb-2 font-medium">3. Dynamic Rebalancing</h3>
					<p class="text-muted-foreground text-sm">
						Positions are automatically moved between fee tiers based on volatility
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
