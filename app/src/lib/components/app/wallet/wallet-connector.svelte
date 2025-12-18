<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Sheet from '$lib/components/ui/sheet';

	import WalletButton from '$lib/wallet/components/wallet-button.svelte';
	import { getWalletState } from '$lib/wallet/wallet.svelte';
	import { onMount } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import WalletTrigger from './wallet-trigger.svelte';
	import { getUser } from '$lib/user/user-state.svelte';
	import { searchTokens } from '../search-panel/data.remote';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import CircleOff from '@lucide/svelte/icons/circle-off';
	import { formatCurrency } from '$lib/utils';
	import { MediaQuery } from 'svelte/reactivity';

	let { ...restProps }: HTMLButtonAttributes = $props();
	const isDesktop = new MediaQuery('(min-width: 768px)');

	/* 
        Responsible for managing wallet connections:
        - Show available wallet options
        - Handle connection and disconnection
    
        Mobile is a UsedComponent, desktop is a panel
    */

	const wallet = getWalletState();
	const userState = getUser();

	onMount(() => {
		return () => {
			if (wallet.walletCore) {
				wallet.eventsCleanUp(wallet.walletCore);
			}
		};
	});

	const allTokens = searchTokens(undefined);
	const UsedComponent = isDesktop.current ? Sheet : Drawer;
</script>

<svelte:boundary>
	{#if allTokens.loading}
		<div class="rounded-full border p-2">
			<LoaderCircle></LoaderCircle>
		</div>
	{:else}
		<UsedComponent.Root>
			<WalletTrigger wallet={wallet.wallet} class={restProps.class}></WalletTrigger>
			{#if wallet.connected}
				<UsedComponent.Content class="pointer-events-auto flex min-h-[60vh] flex-col">
					<UsedComponent.Header class="flex w-full flex-row items-center justify-start gap-4">
						<div
							class="size-6 bg-cover bg-center"
							style="background-image: url({wallet.wallet?.icon});"
						></div>
						<div>
							<UsedComponent.Title>
								<div>Your Wallet</div>
							</UsedComponent.Title>
							<UsedComponent.Description>
								Connected with
								<span class="inline-block max-w-[100px] overflow-clip overflow-ellipsis">
									{wallet.wallet?.accounts.at(0)?.address}
								</span>
							</UsedComponent.Description>
						</div>
					</UsedComponent.Header>

					<div class="flex grow flex-col p-4">
						{#await userState.balances}
							<div class=" self-center">
								<LoaderCircle class="animate-spin"></LoaderCircle>
							</div>
						{:then balances}
							{@const allTokensSymbols = allTokens.current?.map((tok) => tok.symbol) || []}
							{@const filtered = balances.filter((b) =>
								allTokensSymbols.includes(b.metadata.symbol)
							)}
							{#if filtered.length === 0}
								<div
									class="flex h-full min-h-[200px] grow flex-col items-center justify-center rounded border"
								>
									<div class="bg-muted rounded-full p-2">
										<CircleOff class=""></CircleOff>
									</div>
									<div class="text-muted-foreground mt-2 text-sm font-medium">No Assets found</div>
								</div>
							{:else}
								<ul class=" grid gap-4">
									{#each filtered as balance (balance.asset_type)}
										{@const meta = balance.metadata}
										{@const tokenInfo = allTokens.current?.find(
											(tok) => tok.symbol === meta.symbol
										)}
										{#if tokenInfo && parseInt(balance.amount) !== 0}
											{@const balanceDisplay =
												parseInt(balance.amount) * Math.pow(10, -tokenInfo.decimals)}
											<li class="flex items-center gap-4">
												<div
													class="bg-muted size-8 rounded-full border bg-cover bg-center"
													style="background-image: url({tokenInfo?.logo});"
												></div>
												<div class="grow">
													<div class="text-lg">
														{tokenInfo?.name}
													</div>
													<div class="text-muted-foreground text-sm font-semibold uppercase">
														{tokenInfo.symbol}
													</div>
												</div>

												<div>
													{formatCurrency(balanceDisplay, tokenInfo.symbol)}
												</div>
											</li>
										{/if}
									{/each}
								</ul>
							{/if}
						{/await}
					</div>
					<UsedComponent.Footer>
						<Button variant="destructive" onclick={() => wallet.disconnect()}>Disconnect</Button>
					</UsedComponent.Footer>
				</UsedComponent.Content>
			{:else}
				<UsedComponent.Content class="min-h-[60vh]">
					<UsedComponent.Header class="border-b">
						<UsedComponent.Title>Connect to your wallet</UsedComponent.Title>
					</UsedComponent.Header>

					<div class="grid gap-6 p-4">
						<div>
							<h3 class="text-muted-foreground text-sm">Available Wallets</h3>
							<ul class="mt-2 grid gap-4 sm:grid-cols-2 md:grid-cols-1">
								{#each wallet.wallets as availableWallet}
									<WalletButton
										onConnect={() => {
											wallet.connect(availableWallet.name);
										}}
										wallet={availableWallet}
									></WalletButton>
								{/each}
							</ul>
						</div>

						<div>
							<h3 class="text-muted-foreground text-sm">Other Wallets</h3>
							<ul class="mt-2 grid gap-4 sm:grid-cols-2 md:grid-cols-1">
								{#each wallet.notDetectedWallets as unavailableWallet}
									<WalletButton wallet={unavailableWallet}></WalletButton>
								{/each}
							</ul>
						</div>
					</div>
				</UsedComponent.Content>
			{/if}
		</UsedComponent.Root>
	{/if}
</svelte:boundary>
