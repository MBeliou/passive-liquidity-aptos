<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ManagedPositionsList from './managed-positions-list.svelte';

	const { Story } = defineMeta({
		title: 'App/ManagedPositionsList',
		component: ManagedPositionsList,
		tags: ['autodocs']
	});
</script>

<Story name="Loading" args={{ positions: [], loading: true }}>
	{#snippet template(args)}
		<ManagedPositionsList {...args} />
	{/snippet}
</Story>

<Story name="Empty" args={{ positions: [], loading: false }}>
	{#snippet template(args)}
		<ManagedPositionsList {...args} />
	{/snippet}
</Story>

<Story
	name="Single Position"
	args={{
		positions: [
			{
				positionId: '12345',
				poolId: 'APT/USDC',
				tokenA: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.webp',
					name: 'Aptos',
					symbol: 'APT'
				},
				tokenB: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
					name: 'USD Coin',
					symbol: 'USDC'
				},
				tickLower: -8000,
				tickUpper: 12000,
				decimalsA: 8,
				decimalsB: 6,
				fee: 0.3,
				liquidityValue: '$1,234.56',
				status: 'active'
			}
		],
		loading: false
	}}
>
	{#snippet template(args)}
		<ManagedPositionsList {...args} />
	{/snippet}
</Story>

<Story
	name="Multiple Positions"
	args={{
		positions: [
			{
				positionId: '12345',
				poolId: 'APT/USDC',
				tokenA: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.webp',
					name: 'Aptos',
					symbol: 'APT'
				},
				tokenB: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
					name: 'USD Coin',
					symbol: 'USDC'
				},
				tickLower: -10000,
				tickUpper: 10000,
				decimalsA: 8,
				decimalsB: 6,
				fee: 0.01,
				liquidityValue: '$1,234.56',
				status: 'active'
			},
			{
				positionId: '12346',
				poolId: 'APT/DAI',
				tokenA: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.webp',
					name: 'Aptos',
					symbol: 'APT'
				},
				tokenB: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DAI.webp',
					name: 'Dai Stablecoin',
					symbol: 'DAI'
				},
				tickLower: -15000,
				tickUpper: 15000,
				decimalsA: 8,
				decimalsB: 6,
				fee: 0.3,
				liquidityValue: '$2,567.89',
				status: 'active'
			},
			{
				positionId: '12347',
				poolId: 'ETH/USDC',
				tokenA: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg',
					name: 'Wrapped Ether',
					symbol: 'WETH'
				},
				tokenB: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
					name: 'USD Coin',
					symbol: 'USDC'
				},
				tickLower: -5000,
				tickUpper: 8000,
				decimalsA: 8,
				decimalsB: 6,
				fee: 0.05,
				liquidityValue: '$789.12',
				status: 'active'
			}
		],
		loading: false
	}}
>
	{#snippet template(args)}
		<ManagedPositionsList {...args} />
	{/snippet}
</Story>

<Story
	name="Mixed Status"
	args={{
		positions: [
			{
				positionId: '12345',
				poolId: 'APT/USDC',
				tokenA: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.webp',
					name: 'Aptos',
					symbol: 'APT'
				},
				tokenB: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
					name: 'USD Coin',
					symbol: 'USDC'
				},
				tickLower: -10000,
				tickUpper: 10000,
				decimalsA: 8,
				decimalsB: 6,
				fee: 0.3,
				liquidityValue: '$1,234.56',
				status: 'active'
			},
			{
				positionId: '12346',
				poolId: 'APT/DAI',
				tokenA: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.webp',
					name: 'Aptos',
					symbol: 'APT'
				},
				tokenB: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DAI.webp',
					name: 'Dai Stablecoin',
					symbol: 'DAI'
				},
				tickLower: -12000,
				tickUpper: 12000,
				decimalsA: 8,
				decimalsB: 6,
				fee: 0.05,
				liquidityValue: '$2,567.89',
				status: 'rebalancing'
			},
			{
				positionId: '12347',
				poolId: 'ETH/USDC',
				tokenA: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg',
					name: 'Wrapped Ether',
					symbol: 'WETH'
				},
				tokenB: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
					name: 'USD Coin',
					symbol: 'USDC'
				},
				tickLower: -8000,
				tickUpper: 8000,
				decimalsA: 8,
				decimalsB: 6,
				fee: 1,
				liquidityValue: '$0.00',
				status: 'closed'
			}
		],
		loading: false
	}}
>
	{#snippet template(args)}
		<ManagedPositionsList {...args} />
	{/snippet}
</Story>

<Story
	name="Large Liquidity Values"
	args={{
		positions: [
			{
				positionId: '12345',
				poolId: 'APT/USDC',
				tokenA: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.webp',
					name: 'Aptos',
					symbol: 'APT'
				},
				tokenB: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
					name: 'USD Coin',
					symbol: 'USDC'
				},
				tickLower: -20000,
				tickUpper: 20000,
				decimalsA: 8,
				decimalsB: 6,
				fee: 0.3,
				liquidityValue: '$1,234,567.89',
				status: 'active'
			},
			{
				positionId: '12346',
				poolId: 'BTC/ETH',
				tokenA: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WBTC.webp',
					name: 'Wrapped Bitcoin',
					symbol: 'WBTC'
				},
				tokenB: {
					logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg',
					name: 'Wrapped Ether',
					symbol: 'WETH'
				},
				tickLower: -10000,
				tickUpper: 10000,
				decimalsA: 8,
				decimalsB: 8,
				fee: 0.05,
				liquidityValue: '987.6543 WETH',
				status: 'active'
			}
		],
		loading: false
	}}
>
	{#snippet template(args)}
		<ManagedPositionsList {...args} />
	{/snippet}
</Story>
