<script context="module" lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ManagerMovementsList from './manager-movements-list.svelte';

	const { Story } = defineMeta({
		title: 'App/ManagerMovementsList',
		component: ManagerMovementsList,
		tags: ['autodocs']
	});

	const now = new Date();
	const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);
	const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
</script>

<Story name="Loading" args={{ movements: [], loading: true }}>
	{#snippet template(args)}
		<ManagerMovementsList {...args} />
	{/snippet}
</Story>

<Story name="Empty" args={{ movements: [], loading: false }}>
	{#snippet template(args)}
		<ManagerMovementsList {...args} />
	{/snippet}
</Story>

<Story
	name="Deposit Movements"
	args={{
		movements: [
			{
				id: '1',
				type: 'deposit',
				timestamp: hoursAgo(2),
				txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
				amount: '1,000',
				tokenSymbol: 'USDC'
			},
			{
				id: '2',
				type: 'deposit',
				timestamp: daysAgo(1),
				txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
				amount: '500',
				tokenSymbol: 'APT'
			},
			{
				id: '3',
				type: 'deposit',
				timestamp: daysAgo(3),
				txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
				amount: '2,500',
				tokenSymbol: 'USDC'
			}
		],
		loading: false
	}}
>
	{#snippet template(args)}
		<ManagerMovementsList {...args} />
	{/snippet}
</Story>

<Story
	name="Rebalance Movements"
	args={{
		movements: [
			{
				id: '1',
				type: 'rebalance',
				timestamp: hoursAgo(1),
				txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
				fromPool: {
					tokenA: 'APT',
					tokenB: 'USDC',
					fee: 0.3
				},
				toPool: {
					tokenA: 'APT',
					tokenB: 'USDC',
					fee: 1
				},
				amountMoved: '$1,234.56'
			},
			{
				id: '2',
				type: 'rebalance',
				timestamp: hoursAgo(12),
				txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
				fromPool: {
					tokenA: 'APT',
					tokenB: 'DAI',
					fee: 0.05
				},
				toPool: {
					tokenA: 'APT',
					tokenB: 'DAI',
					fee: 0.3
				},
				amountMoved: '$2,567.89'
			},
			{
				id: '3',
				type: 'rebalance',
				timestamp: daysAgo(2),
				txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
				fromPool: {
					tokenA: 'WETH',
					tokenB: 'USDC',
					fee: 1
				},
				toPool: {
					tokenA: 'WETH',
					tokenB: 'USDC',
					fee: 0.3
				},
				amountMoved: '$789.12'
			}
		],
		loading: false
	}}
>
	{#snippet template(args)}
		<ManagerMovementsList {...args} />
	{/snippet}
</Story>

<Story
	name="Withdraw Movements"
	args={{
		movements: [
			{
				id: '1',
				type: 'withdraw',
				timestamp: hoursAgo(3),
				txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
				amount: '500',
				tokenSymbol: 'USDC'
			},
			{
				id: '2',
				type: 'withdraw',
				timestamp: daysAgo(1),
				txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
				amount: '100',
				tokenSymbol: 'APT'
			}
		],
		loading: false
	}}
>
	{#snippet template(args)}
		<ManagerMovementsList {...args} />
	{/snippet}
</Story>

<Story
	name="Mixed Movements"
	args={{
		movements: [
			{
				id: '1',
				type: 'rebalance',
				timestamp: hoursAgo(1),
				txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
				fromPool: {
					tokenA: 'APT',
					tokenB: 'USDC',
					fee: 0.3
				},
				toPool: {
					tokenA: 'APT',
					tokenB: 'USDC',
					fee: 1
				},
				amountMoved: '$1,234.56'
			},
			{
				id: '2',
				type: 'deposit',
				timestamp: hoursAgo(5),
				txHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
				amount: '1,000',
				tokenSymbol: 'USDC'
			},
			{
				id: '3',
				type: 'rebalance',
				timestamp: hoursAgo(12),
				txHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
				fromPool: {
					tokenA: 'APT',
					tokenB: 'DAI',
					fee: 0.05
				},
				toPool: {
					tokenA: 'APT',
					tokenB: 'DAI',
					fee: 0.3
				},
				amountMoved: '$2,567.89'
			},
			{
				id: '4',
				type: 'withdraw',
				timestamp: daysAgo(1),
				txHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
				amount: '500',
				tokenSymbol: 'USDC'
			},
			{
				id: '5',
				type: 'deposit',
				timestamp: daysAgo(2),
				txHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
				amount: '750',
				tokenSymbol: 'APT'
			},
			{
				id: '6',
				type: 'rebalance',
				timestamp: daysAgo(3),
				txHash: '0x6666666666666666666666666666666666666666666666666666666666666666',
				fromPool: {
					tokenA: 'WETH',
					tokenB: 'USDC',
					fee: 1
				},
				toPool: {
					tokenA: 'WETH',
					tokenB: 'USDC',
					fee: 0.3
				},
				amountMoved: '$789.12'
			}
		],
		loading: false
	}}
>
	{#snippet template(args)}
		<ManagerMovementsList {...args} />
	{/snippet}
</Story>
