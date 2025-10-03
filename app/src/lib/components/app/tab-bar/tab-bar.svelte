<script lang="ts" module>
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { type Component } from 'svelte';

	export type TabBarLink = {
		label: string;
		url: string;
		icon: Component;
		isActive?: boolean;
	};
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import SearchPanel from '../search-panel/search-panel.svelte';
	import ShareButton from '../share-button/share-button.svelte';
	import WalletConnector from '../wallet/wallet-connector.svelte';
	import { getTabBarState } from './tab-bar-state.svelte';

	const isMobile = new IsMobile();
	let {
		links
	}: {
		links: TabBarLink[];
	} = $props();


	const tabBarState = getTabBarState();
</script>

{#if isMobile.current}
	<!--  on bottom, separate -->
	<div class="fixed inset-x-4 bottom-2 isolate">
		<div class="relative flex items-stretch justify-between">
			<div class="bg-muted flex h-fit gap-1 rounded-full p-1">
				{#each links as link (link.label)}
					<a
						data-active-tab={link.isActive}
						href={link.url}
						class={[
							'z-20 flex h-12 flex-col items-center justify-center gap-0.5 px-6 py-1 text-xs',
							'text-muted-foreground hover:text-foreground',
							link.isActive && 'text-primary bg-muted-foreground/20 rounded-full'
						]}
					>
						<link.icon size={16}></link.icon>
						{link.label}
					</a>
				{/each}
			</div>

			<SearchPanel ></SearchPanel>
		</div>
	</div>

	<div
		class="pointer-events-none fixed inset-x-4 top-8 isolate z-50 flex {tabBarState.backButton ? 'justify-between' : 'justify-end'} [&>*]:pointer-events-auto"
	>
		{#if tabBarState.backButton}
			<Button
				href={tabBarState.backButton}
				size="icon"
				variant="outline"
				class="rounded-full border p-2 backdrop-blur"
			>
				<ArrowLeft class="h-5 w-5" />
			</Button>
		{/if}
		<WalletConnector class=" backdrop-blur"></WalletConnector>
	</div>
{:else}
	<!--  on top -->
	<div class="pointer-events-none fixed inset-x-0 top-8 mx-auto grid max-w-7xl grid-cols-3 px-4">
		<div class="flex items-center justify-start">
			{#if tabBarState.backButton}
				<Button
					href={tabBarState.backButton}
					size="icon"
					variant="ghost"
					class="pointer-events-auto rounded-full"
				>
					<ArrowLeft class="h-5 w-5" />
				</Button>
			{/if}
		</div>

		<div
			class="bg-muted pointer-events-auto col-start-2 mx-auto flex items-center rounded-full p-1 md:justify-center"
		>
			{#each links as link (link.label)}
				<a
					data-active-tab={link.isActive}
					href={link.url}
					class={[
						'z-20 px-6 py-2 text-sm',
						'text-muted-foreground hover:text-foreground',
						link.isActive && 'text-primary bg-muted-foreground/20 rounded-full'
					]}
				>
					{link.label}
				</a>
			{/each}

			<SearchPanel class="h-full w-full pr-3" ></SearchPanel>
		</div>

		<div class="flex items-center justify-end gap-2">
			{#if tabBarState.shareButton}
				<ShareButton content={tabBarState.shareButton} class="pointer-events-auto"></ShareButton>
			{/if}
			<WalletConnector class=" pointer-events-auto"></WalletConnector>
		</div>
	</div>
{/if}
