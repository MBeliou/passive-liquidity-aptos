<script lang="ts" module>
	import Button from '$lib/components/ui/button/button.svelte';
	import type { Component } from 'vitest-browser-svelte';

	export type MobileLink = {
		label: string;
		url: string;
		icon: Component;
	};
</script>

<script lang="ts">
	//let isMobile = new MediaQuery('max-width: 768px');
	const isMobile = true;
	//const isMobile = new IsMobile();
	let {} = $props();
</script>

{#if isMobile}
	<!--  on bottom, separate -->

	<div class="flex items-center justify-between">
		<div class=""></div>

		<Button size="icon"></Button>
	</div>
{:else}
	<!--  on top -->
	<div class="flex items-center justify-between bg-red-500 md:justify-center">
		<div class="">placeholder</div>
	</div>
{/if}
