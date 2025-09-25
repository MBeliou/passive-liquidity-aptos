<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import type { AdapterWallet } from '@aptos-labs/wallet-adapter-core';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import UserIcon from '@lucide/svelte/icons/user';

	let { wallet, ...restProps }: { wallet: AdapterWallet | null } & HTMLButtonAttributes = $props();
</script>

<Drawer.Trigger class={['relative rounded-full border p-2', restProps.class]}>
	<UserIcon></UserIcon>
	{#if wallet}
		<img src={wallet.icon} alt="{wallet.name} icon" class="rounded-full size-5 absolute bottom-0 right-0" />
	{/if}
</Drawer.Trigger>
