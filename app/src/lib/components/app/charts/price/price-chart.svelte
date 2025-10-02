<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { Daum } from '$lib/shared/tapp/api';
	import { scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { Area, AreaChart, LinearGradient } from 'layerchart';

	let { data, tokenSymbol }: { data: Daum[]; tokenSymbol?: string } = $props();

	const chartData = $derived(
		data.map((d) => ({
			date: new Date(d.x),
			price: parseFloat(d.y)
		}))
	);

	const COLORS = {
		positive: 'oklch(76.8% 0.233 130.85)',
		negative: 'oklch(63.7% 0.237 25.331)',
		neutral: 'oklch(68.1% 0.162 75.834)'
	};
	const usedColor = (() => {
		const lastPrice = chartData.at(-1)?.price ?? 0;
		const firstPrice = chartData.at(0)?.price ?? 0;

		if (lastPrice > firstPrice) {
			return COLORS.positive;
		}
		if (lastPrice < firstPrice) {
			return COLORS.negative;
		}

		return COLORS.neutral;
	})();

	const chartConfig = {
		//price: { label: 'Price', color: 'var(--chart-1)' }
		price: { label: 'Price', color: usedColor }
	} satisfies Chart.ChartConfig;

	const seriesPadding = 0.05; // 5% higher and lower
	const range = $derived.by(() => {
		const seriesPrices = chartData.map((c) => c.price);
		const seriesMin = Math.min(...seriesPrices);
		const seriesMax = Math.max(...seriesPrices);
		const appliedMin = Math.max(0, seriesMin * (1 - seriesPadding));
		const appliedMax = seriesMax * (1 + seriesPadding);

		return [appliedMin, appliedMax];
	});
</script>

<Chart.Container config={chartConfig}>
	<AreaChart
		data={chartData}
		x="date"
		xScale={scaleUtc()}
		yDomain={range}
		series={[
			{
				key: 'price',
				label: 'price',
				color: 'var(--color-price)'
			}
		]}
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
			yAxis: {
				format: (v: number) => (tokenSymbol ? `${tokenSymbol} ${v.toFixed(2)}` : v.toFixed(2))
			}
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
			></Chart.Tooltip>
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
