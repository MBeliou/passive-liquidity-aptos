<script lang="ts">
	import {
		type AdapterNotDetectedWallet,
		type AdapterWallet,
		WalletReadyState,
		isRedirectable
	} from '@aptos-labs/wallet-adapter-core';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		wallet,
		onConnect,
		...restProps
	}: {
		wallet: AdapterWallet | AdapterNotDetectedWallet;
		onConnect?: (walletName: string) => void;
	} & HTMLButtonAttributes = $props();
</script>

{#if wallet.readyState === WalletReadyState.Installed}
	<button
		class="flex items-center gap-2"
		onclick={() => {
			onConnect?.(wallet.name);
		}}
	>
		<img src={wallet.icon} alt="{wallet.name} icon" class="size-8" />
		<span>
			{#if wallet.name.startsWith('Continue')}
				{wallet.name}
			{:else}
				Connect to {wallet.name}
			{/if}
		</span>
	</button>
{:else}
	<a href={wallet.url}>
		<img src={wallet.icon} alt="{wallet.name} icon" class="size-8" />
		<span>
			Install {wallet.name}
		</span>
	</a>
{/if}
