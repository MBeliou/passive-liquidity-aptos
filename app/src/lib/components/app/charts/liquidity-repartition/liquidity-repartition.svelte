<script lang="ts" module>
	export type ChartData = Record<Fee, number>;
</script>

<script lang="ts">
	import { Arc, PieChart, Text } from 'layerchart';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { FEE_TIERS, type Fee } from '../pool/utils';
	import { makeFeeLabel } from '../pool/pool-chart.svelte';

	let {
		liquidity,
		valueFormatter = (v: number) => v.toFixed(2)
	}: { liquidity: ChartData; valueFormatter?: (v: number) => string } = $props();

	const chartConfig = Object.fromEntries(
		FEE_TIERS.map((f, i) => {
			const item = {
				label: makeFeeLabel(f),
				color: `var(--chart-${i + 1})`
			};

			return [f, item];
		})
	);

	const chartData = FEE_TIERS.map((f, i) => {
		return {
			key: f,
			label: makeFeeLabel(f),
			color: chartConfig[f].color,
			value: valueFormatter(liquidity[f] ?? 0)
		};
	});
</script>

<Chart.Container config={chartConfig} class=" aspect-square max-h-[250px]">
	<PieChart
		data={chartData}
		key="key"
		value="value"
		cRange={chartData.map((d) => d.color)}
		innerRadius={60}
		c="color"
		props={{
			pie: {
				motion: 'tween'
			}
		}}
		legend
	>
		{#snippet tooltip()}
			<Chart.Tooltip hideLabel />
		{/snippet}
		{#snippet arc({ props, visibleData, index })}
			<Arc {...props}>
				{#snippet children({ getArcTextProps })}
					<Text
						value={visibleData[index].value}
						{...getArcTextProps('outer', {
							startOffset: '70%',
							outerPadding: 14
						})}
						class="fill-foreground"
					/>
				{/snippet}
			</Arc>
		{/snippet}
	</PieChart>
</Chart.Container>
