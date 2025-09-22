<script lang="ts" module>
	import { browser } from '$app/environment';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import Search from '@lucide/svelte/icons/search';
	import type { Component } from 'svelte';

	export type TabBarLink = {
		label: string;
		url: string;
		icon: Component;
		isActive?: boolean;
	};
</script>

<script lang="ts">
	const isMobile = new IsMobile();
	let {
		links
	}: {
		links: TabBarLink[];
	} = $props();
</script>

{#if isMobile.current}
	<!--  on bottom, separate -->

	<div class="fixed inset-x-0 bottom-2 isolate">
		<div class="relative flex items-stretch justify-between">
			<div class="bg-muted flex h-fit gap-1 rounded-full p-1">
				{#each links as link (link.label)}
					<a
						data-active-tab={link.isActive}
						href={link.url}
						class={[
							'z-20 flex h-16 flex-col items-center gap-0.5 px-6 py-2 text-sm',
							'text-muted-foreground hover:text-foreground',
							link.isActive && 'text-primary bg-muted-foreground/20 rounded-full'
						]}
					>
						<link.icon></link.icon>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- if action button -->
			<button
				class="bg-muted flex aspect-square h-16 w-16 items-center justify-center rounded-full"
			>
				<Search></Search>
			</button>
		</div>
	</div>
{:else}
	<!--  on top -->
	<div class="flex items-center justify-between bg-red-500 md:justify-center">
		<div class="">placeholder</div>
	</div>
{/if}
