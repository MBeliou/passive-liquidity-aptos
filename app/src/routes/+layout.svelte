<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import TabBar, { type TabBarLink } from '$lib/components/app/tab-bar/tab-bar.svelte';
	import PiggyBank from '@lucide/svelte/icons/piggy-bank';

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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode="dark" track={false} />

<div class="min-h-screen pb-20 max-w-7xl mx-auto border-x w-full">
	{@render children?.()}
</div>

<TabBar {links}></TabBar>
