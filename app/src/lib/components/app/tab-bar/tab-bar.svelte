<script lang="ts" module>
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import Search from '@lucide/svelte/icons/search';
	import { type Component } from 'svelte';

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
	<div class="pointer-events-none fixed inset-x-0 top-8 flex justify-center">
		<div class="bg-muted pointer-events-auto flex items-center rounded-full p-1 md:justify-center">
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
			<button
				class="hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground flex h-full items-center justify-center rounded-full px-3 transition-all"
			>
				<Search></Search>
			</button>
		</div>
	</div>
{/if}
