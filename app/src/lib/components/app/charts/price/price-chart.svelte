<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { Area, AreaChart, LinearGradient } from 'layerchart';
	import type { Daum } from '$lib/shared/tapp/api';

	let { data }: { data: Daum[] } = $props();

	const chartData = $derived(
		data.map((d) => ({
			date: new Date(d.x),
			price: parseFloat(d.y)
		}))
	);

	const chartConfig = {
		price: { label: 'price', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;
</script>

<Chart.Container config={chartConfig}>
	<AreaChart
		data={chartData}
		x="date"
		xScale={scaleUtc()}
		yPadding={[0, 25]}
		series={[
			{
				key: 'price',
				label: 'price',
				color: 'var(--color-price)'
			}
		]}
		seriesLayout="stack"
		props={{
			area: {
				curve: curveNatural,
				'fill-opacity': 0.4,
				line: { class: 'stroke-1' },
				motion: 'tween'
			},
			xAxis: {
				format: (v: Date) => v.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
			},
			yAxis: { format: () => '' }
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip
				indicator="dot"
				labelFormatter={(v: Date) => {
					return v.toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						hour: 'numeric',
						minute: '2-digit'
					});
				}}
			/>
		{/snippet}
		{#snippet marks({ series, getAreaProps })}
			{#each series as s, i (s.key)}
				<LinearGradient
					stops={[s.color ?? '', 'color-mix(in lch, ' + s.color + ' 10%, transparent)']}
					vertical
				>
					{#snippet children({ gradient })}
						<Area {...getAreaProps(s, i)} fill={gradient} />
					{/snippet}
				</LinearGradient>
			{/each}
		{/snippet}
	</AreaChart>
</Chart.Container>
