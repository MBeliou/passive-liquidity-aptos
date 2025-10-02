<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LiquidityChart from './liquidity-repartition.svelte';
	import * as Card from '$lib/components/ui/card';

	const { Story } = defineMeta({
		title: 'Charts/Liquidity',
		component: LiquidityChart,
		tags: ['autodocs'],
		argTypes: {},
		args: {
            liquidity: {
                "0.01": 120,
                "0.05": 0,
                "0.3": 111,
                "1": 12
            }
        }
	});
</script>

<Story name="Default" />

<Story name="Mostly In Range" args={{
	liquidity: {
		"0.01": 450,
		"0.05": 380,
		"0.3": 120,
		"1": 50
	}
}}>
	{#snippet template(args)}
		<div class="grid min-h-[200px] w-full gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>In Range</Card.Title>
					<Card.Description>
						Repartition of liquidity that is close to the current price
					</Card.Description>
				</Card.Header>
				<LiquidityChart {...args} />
			</Card.Root>
		</div>
	{/snippet}
</Story>

<Story name="Out of Range" args={{
	liquidity: {
		"0.01": 0,
		"0.05": 0,
		"0.3": 0,
		"1": 800
	}
}}>
	{#snippet template(args)}
		<div class="grid min-h-[200px] w-full gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Out of Range</Card.Title>
					<Card.Description>
						All liquidity is in the highest fee tier, indicating positions are out of range
					</Card.Description>
				</Card.Header>
				<LiquidityChart {...args} />
			</Card.Root>
		</div>
	{/snippet}
</Story>

<Story name="Higher Tier Concentration" args={{
	liquidity: {
		"0.01": 50,
		"0.05": 80,
		"0.3": 620,
		"1": 250
	}
}}>
	{#snippet template(args)}
		<div class="grid min-h-[200px] w-full gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Higher Fee Tiers</Card.Title>
					<Card.Description>
						Liquidity concentrated in higher fee tiers (0.3% and 1%)
					</Card.Description>
				</Card.Header>
				<LiquidityChart {...args} />
			</Card.Root>
		</div>
	{/snippet}
</Story>

<Story name="Lower Tier Concentration" args={{
	liquidity: {
		"0.01": 650,
		"0.05": 300,
		"0.3": 40,
		"1": 10
	}
}}>
	{#snippet template(args)}
		<div class="grid min-h-[200px] w-full gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Lower Fee Tiers</Card.Title>
					<Card.Description>
						Liquidity heavily concentrated in the lowest fee tiers (0.01% and 0.05%)
					</Card.Description>
				</Card.Header>
				<LiquidityChart {...args} />
			</Card.Root>
		</div>
	{/snippet}
</Story>
