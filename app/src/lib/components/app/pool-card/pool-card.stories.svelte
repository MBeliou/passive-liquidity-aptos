<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PoolCard from './pool-card.svelte';

	const { Story } = defineMeta({
		title: 'App/PoolCard',
		component: PoolCard,
		tags: ['autodocs']
	});

	const aptToken = {
		id: '0x1::aptos_coin::AptosCoin',
		symbol: 'APT',
		name: 'Aptos',
		logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.webp',
		decimals: 8
	};

	const usdcToken = {
		id: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T',
		symbol: 'USDC',
		name: 'USD Coin',
		logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
		decimals: 6
	};

	const daiToken = {
		id: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::dai::DAI',
		symbol: 'DAI',
		name: 'Dai Stablecoin',
		logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DAI.webp',
		decimals: 6
	};

	const wethToken = {
		id: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::weth::WETH',
		symbol: 'WETH',
		name: 'Wrapped Ether',
		logo: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg',
		decimals: 8
	};
</script>

<Story
	name="Single Fee Tier"
	args={{
		tokenA: aptToken,
		tokenB: usdcToken,
		uniqueFees: ['0.3'],
		slug: 'apt-usdc'
	}}
>
	{#snippet template(args)}
		<div class="max-w-md">
			<PoolCard {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="Multiple Fee Tiers"
	args={{
		tokenA: aptToken,
		tokenB: usdcToken,
		uniqueFees: ['0.01', '0.3', '1'],
		slug: 'apt-usdc'
	}}
>
	{#snippet template(args)}
		<div class="max-w-md">
			<PoolCard {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="All Fee Tiers Available"
	args={{
		tokenA: aptToken,
		tokenB: daiToken,
		uniqueFees: ['0.01', '0.05', '0.3', '1'],
		slug: 'apt-dai'
	}}
>
	{#snippet template(args)}
		<div class="max-w-md">
			<PoolCard {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="No Fee Tiers (Edge Case)"
	args={{
		tokenA: wethToken,
		tokenB: usdcToken,
		uniqueFees: [],
		slug: 'weth-usdc'
	}}
>
	{#snippet template(args)}
		<div class="max-w-md">
			<PoolCard {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="Two Adjacent Tiers"
	args={{
		tokenA: aptToken,
		tokenB: usdcToken,
		uniqueFees: ['0.05', '0.3'],
		slug: 'apt-usdc'
	}}
>
	{#snippet template(args)}
		<div class="max-w-md">
			<PoolCard {...args} />
		</div>
	{/snippet}
</Story>
