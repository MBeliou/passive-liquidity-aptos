<script lang="ts">
	import Button, { type ButtonProps } from '$lib/components/ui/button/button.svelte';
	import Check from '@lucide/svelte/icons/check';
	import RefreshCW from '@lucide/svelte/icons/refresh-cw';

	let state = $state<'idle' | 'refreshing' | 'refreshed'>('idle');

	let { ...restProps }: ButtonProps = $props();

	function clickHandler(e: ButtonProps['onclick']) {
		try {
			state = 'refreshing';
			// @ts-expect-error Typescript being overbearing
			restProps.onclick?.(e);
		} catch (error) {
			console.error(error);
		} finally {
			state = 'idle';
		}
	}
</script>

<!--
@component
    Sends a refresh request. Once the request is sent, the button gets disabled so we don't end up nuking the API.

-->

<Button
	variant="outline"
	disabled={state === 'idle' ? restProps.disabled : true}
	onclick={(e) => {
		return clickHandler(e as unknown as ButtonProps['onclick']);
	}}
>
	{#if state === 'idle' || state === 'refreshing'}
		Refresh <RefreshCW class={[state === 'refreshing' && 'animate-spin']}></RefreshCW>
	{:else}
		Refreshed <Check></Check>
	{/if}
</Button>
