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
		class="flex w-full items-center gap-2 rounded-lg border p-2 hover:border-foreground duration-500"
		onclick={() => {
			onConnect?.(wallet.name);
		}}
	>
		<img src={wallet.icon} alt="{wallet.name} icon" class="size-8" />
		<span>
			{#if wallet.name.startsWith('Continue')}
				{@const nameParts = wallet.name.split('with')}
				Continue with
				<span class="text-lg font-medium">{nameParts[1]}</span>
			{:else}
				Connect to <span class="text-lg font-medium tracking-wide">{wallet.name}</span>
			{/if}
		</span>
	</button>
{:else}
	<a
		href={wallet.url}
		class="flex w-full items-center gap-2 rounded-lg border py-2 hover:border-foreground"
		target="_blank"
		rel="noreferrer"
	>
		<img src={wallet.icon} alt="{wallet.name} icon" class="size-8" />
		<span>
			Install <span class="text-lg font-medium tracking-wide">{wallet.name}</span>
		</span>
	</a>
{/if}
