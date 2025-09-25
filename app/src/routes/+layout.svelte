<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import TabBar, { type TabBarLink } from '$lib/components/app/tab-bar/tab-bar.svelte';
	import PiggyBank from '@lucide/svelte/icons/piggy-bank';
	import { setWalletState, WalletState } from '$lib/wallet/wallet.svelte';
	import { Network } from '@aptos-labs/ts-sdk';
	import { setUser, UserState } from '$lib/user/user-state.svelte';
	import { useAptos } from '$lib/shared';

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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode="dark" track={false} />

<div class="mx-auto min-h-screen w-full max-w-7xl border-x pb-20">
	{@render children?.()}
</div>

<TabBar {links}></TabBar>
