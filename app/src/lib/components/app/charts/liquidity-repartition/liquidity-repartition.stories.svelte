<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LiquidityChart from './liquidity-repartition.svelte';

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
