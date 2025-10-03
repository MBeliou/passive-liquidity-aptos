<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ManagerBalancesList from './manager-balances-list.svelte';

	const { Story } = defineMeta({
		component: ManagerBalancesList,
		title: 'App/ManagerBalancesList'
	});
</script>

<Story name="Loading">
	{#snippet template(args)}
		<ManagerBalancesList {...args} />
	{/snippet}
	balances={[]}
	loading={true}
</Story>

<Story name="Empty">
	{#snippet template(args)}
		<ManagerBalancesList {...args} />
	{/snippet}
	balances={[]}
	loading={false}
</Story>

<Story name="Single Balance">
	{#snippet template(args)}
		<ManagerBalancesList {...args} />
	{/snippet}
	balances={[
		{
			tokenId: '0x000000000000000000000000000000000000000000000000000000000000000a',
			amount: '500000000',
			token: {
				id: '0x000000000000000000000000000000000000000000000000000000000000000a',
				symbol: 'APT',
				name: 'Aptos',
				logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.svg',
				decimals: 8
			}
		}
	]}
</Story>

<Story name="Multiple Balances">
	{#snippet template(args)}
		<ManagerBalancesList {...args} />
	{/snippet}
	balances={[
		{
			tokenId: '0x000000000000000000000000000000000000000000000000000000000000000a',
			amount: '500000000',
			token: {
				id: '0x000000000000000000000000000000000000000000000000000000000000000a',
				symbol: 'APT',
				name: 'Aptos',
				logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.svg',
				decimals: 8
			}
		},
		{
			tokenId: '0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b',
			amount: '1000000000',
			token: {
				id: '0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b',
				symbol: 'USDT',
				name: 'Tether USD',
				logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg',
				decimals: 6
			}
		},
		{
			tokenId: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
			amount: '25000000000',
			token: {
				id: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
				symbol: 'USDC',
				name: 'USD Coin',
				logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
				decimals: 6
			}
		}
	]}
</Story>

<Story name="Large Amounts">
	{#snippet template(args)}
		<ManagerBalancesList {...args} />
	{/snippet}
	balances={[
		{
			tokenId: '0x000000000000000000000000000000000000000000000000000000000000000a',
			amount: '123456789012345678',
			token: {
				id: '0x000000000000000000000000000000000000000000000000000000000000000a',
				symbol: 'APT',
				name: 'Aptos',
				logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.svg',
				decimals: 8
			}
		}
	]}
</Story>

<Story name="Missing Token Info">
	{#snippet template(args)}
		<ManagerBalancesList {...args} />
	{/snippet}
	balances={[
		{
			tokenId: '0x123',
			amount: '1000000',
			token: null
		}
	]}
</Story>
