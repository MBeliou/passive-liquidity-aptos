<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import WalletButton from '$lib/wallet/components/wallet-button.svelte';
	import { getWallet } from '$lib/wallet/wallet.svelte';
	import { onMount } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import WalletTrigger from './wallet-trigger.svelte';
	let { ...restProps }: HTMLButtonAttributes = $props();
	/* 
        Responsible for managing wallet connections:
        - Show available wallet options
        - Handle connection and disconnection
    
        Mobile is a drawer, desktop is a panel
    */

	const wallet = getWallet();

	onMount(() => {
		return () => {
			if (wallet.walletCore) {
				wallet.eventsCleanUp(wallet.walletCore);
			}
		};
	});

	let open = $state(false);
</script>

<Drawer.Root bind:open>
	<WalletTrigger wallet={wallet.wallet} class={restProps.class}></WalletTrigger>
	{#if wallet.connected}
		<Drawer.Content>
			<Drawer.Header>
				<Drawer.Title>Are you sure absolutely sure?</Drawer.Title>
				<Drawer.Description>This action cannot be undone.</Drawer.Description>
			</Drawer.Header>

			<div></div>
			<Drawer.Footer>
				<Button>Submit</Button>
				<Drawer.Close>Cancel</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	{:else}
		<Drawer.Content class="min-h-[60vh]">
			<Drawer.Header class="border-b">
				<Drawer.Title>Connect to your wallet</Drawer.Title>
			</Drawer.Header>

			<div class="grid gap-6 p-4">
				<div>
					<h3 class="text-muted-foreground text-sm">Available Wallets</h3>
					<ul class="mt-2 grid gap-4 sm:grid-cols-2">
						{#each wallet.wallets as availableWallet}
							<WalletButton
								onConnect={() => {
									wallet.connect(availableWallet.name);
									open = false;
								}}
								wallet={availableWallet}
							></WalletButton>
						{/each}
					</ul>
				</div>

				<div>
					<h3 class="text-muted-foreground text-sm">Other Wallets</h3>
					<ul class="mt-2 grid gap-4 sm:grid-cols-2">
						{#each wallet.notDetectedWallets as unavailableWallet}
							<WalletButton wallet={unavailableWallet}></WalletButton>
						{/each}
					</ul>
				</div>
			</div>
		</Drawer.Content>
	{/if}
</Drawer.Root>
