<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import TabBar, { type TabBarLink } from '$lib/components/app/tab-bar/tab-bar.svelte';
	import PiggyBank from '@lucide/svelte/icons/piggy-bank';
	import { setWallet } from '$lib/wallet/wallet.svelte';
	import { Network } from '@aptos-labs/ts-sdk';

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

	setWallet(['Petra'], {
		network: Network.MAINNET,
		crossChainWallets: true
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode="dark" track={false} />

<div class="mx-auto min-h-screen w-full max-w-7xl border-x pb-20">
	{@render children?.()}
</div>

<TabBar {links}></TabBar>
