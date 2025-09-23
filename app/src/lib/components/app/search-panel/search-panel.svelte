<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Search from '@lucide/svelte/icons/search';
	import { searchTokens } from './data.remote';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	const filters = ['all', 'pools', 'tokens'] as const;

	let currentFilter = $state<(typeof filters)[number]>('all');

	let searchContent = $state('');
	const query = (() => searchTokens(searchContent))();
	let isSearching = $derived(query.loading);
</script>

<Drawer.Root>
	<Drawer.Trigger>
		<button class="bg-muted flex aspect-square h-16 w-16 items-center justify-center rounded-full">
			<Search></Search>
		</button>
	</Drawer.Trigger>
	<Drawer.Content class="flex min-h-[90%] flex-col overflow-hidden">
		<Drawer.Header>
			<div class="bg-muted flex items-center gap-1 rounded-full p-1">
				{#each filters as filter}
					<button
						onclick={() => (currentFilter = filter)}
						class={[
							'w-full rounded-full px-3 py-1 text-sm capitalize',
							currentFilter === filter && 'bg-muted-foreground/20'
						]}>{filter}</button
					>
				{/each}
			</div>
		</Drawer.Header>

		<div class="flex-grow gap-4 overflow-y-auto p-4">
			<h2 class=" mb-1 text-xl font-medium">Tokens</h2>
			<ul class="overflow-y-auto">
				{#each await searchTokens(searchContent) as token (token.id)}
					<li class="flex items-center gap-2 border-t py-3">
						<div
							class="bg-muted flex size-10 items-center justify-center overflow-hidden rounded-full"
						>
							{#if token.logo}
								<div
									class="size-full bg-cover bg-center"
									style="background-image: url({token.logo});"
								></div>
							{:else}
								<div class="text-muted-foreground">?</div>
							{/if}
						</div>
						<div class="flex-grow">
							<div class="text-lg font-medium">
								{token.name}
							</div>
							<div class="text-muted-foreground text-xs font-semibold">
								{token.symbol}
							</div>
						</div>

						<div>
							<ChevronRight></ChevronRight>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<Drawer.Footer>
			<div class="relative">
				<div class="absolute inset-y-0 left-4 flex flex-col justify-center">
					{#if isSearching}
						<LoaderCircle class="text-muted-foreground animate-spin" size={18}></LoaderCircle>
					{:else}
						<Search class="text-muted-foreground" size={18}></Search>
					{/if}
				</div>
				<Input
					class="rounded-full pl-10"
					type="search"
					placeholder="Search for a token or a pool..."
					bind:value={searchContent}
					oninput={(v) => {
						searchTokens(searchContent).refresh();
					}}
				></Input>
			</div>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
