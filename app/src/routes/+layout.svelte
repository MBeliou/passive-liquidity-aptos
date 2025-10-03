<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import TabBar, { type TabBarLink } from '$lib/components/app/tab-bar/tab-bar.svelte';
	import PiggyBank from '@lucide/svelte/icons/piggy-bank';
	import { setWalletState, WalletState } from '$lib/wallet/wallet.svelte';
	import { Network } from '@aptos-labs/ts-sdk';
	import { setUser, UserState } from '$lib/user/user-state.svelte';
	import { useAptos } from '$lib/shared';
	import { setTabBarState, TabBarState } from '$lib/components/app/tab-bar/tab-bar-state.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { navigating } from '$app/state';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	let { children } = $props();

	const links: TabBarLink[] = [
		{
			label: 'Earn',
			icon: PiggyBank,
			url: '/',
			isActive: true
		},
		{
			label: 'Profile',
			icon: PiggyBank,
			url: '/profile',
			isActive: false
		}
	];

	const walletState = new WalletState(
		['Petra', 'Backpack', 'Continue with Google', 'Continue with Apple'],
		{
			network: Network.MAINNET,
			crossChainWallets: true
		}
	);
	setWalletState(walletState);

	const userState = new UserState(walletState, useAptos());
	setUser(userState);
	const tabBarState = new TabBarState();
	setTabBarState(tabBarState);
</script>

<ModeWatcher />
<Toaster />

<div class="mx-auto mt-8 min-h-screen w-full max-w-7xl pb-20">
	{#if navigating.to}
		<div class="flex min-h-screen flex-col items-center justify-center">
			<LoaderCircle
				class=" animate-spin"
			></LoaderCircle>
		</div>
	{:else}
		{@render children?.()}
	{/if}
</div>
<TabBar {links}></TabBar>
