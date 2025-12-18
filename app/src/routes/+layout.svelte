<script lang="ts">
	import { navigating, page } from '$app/state';
	import { setTabBarState, TabBarState } from '$lib/components/app/tab-bar/tab-bar-state.svelte';
	import TabBar, { type TabBarLink } from '$lib/components/app/tab-bar/tab-bar.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { setUser, UserState } from '$lib/user/user-state.svelte';
	import { setWalletState, WalletState } from '$lib/wallet/wallet.svelte';
	import { Network } from '@aptos-labs/ts-sdk';
	import Gauge from '@lucide/svelte/icons/gauge';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import PiggyBank from '@lucide/svelte/icons/piggy-bank';
	import CreditCard from '@lucide/svelte/icons/credit-card';

	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import { useAptos } from '$lib/shared/aptos';

	let { children } = $props();

	const links: TabBarLink[] = $derived([
		{
			label: 'Earn',
			icon: PiggyBank,
			url: '/',
			isActive: page.url.pathname === '/' || page.url.pathname.startsWith('/pools')
		},
		{
			label: 'Money Markets',
			icon: CreditCard,
			url: '/money-market',
			isActive: page.url.pathname.startsWith('/money-market')
		}
	]);

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

<svelte:head>
	<title>Convergence - Optimize your liquidity</title>
</svelte:head>

<ModeWatcher />
<Toaster />
<div class="mx-auto mt-8 min-h-screen w-full max-w-7xl pb-20">
	{#if navigating.to}
		<div class="flex min-h-screen flex-col items-center justify-center">
			<LoaderCircle class=" animate-spin"></LoaderCircle>
		</div>
	{:else}
		{@render children?.()}
	{/if}
</div>
<TabBar {links}></TabBar>
