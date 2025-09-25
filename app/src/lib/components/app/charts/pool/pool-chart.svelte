<script lang="ts" module>
</script>

<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { scaleBand } from 'd3-scale';
	import { BarChart, Highlight, Line, Svg, type ChartContextValue } from 'layerchart';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { cubicInOut } from 'svelte/easing';

	const FEE_TIERS = ['0.01', '0.03', '0.05', '1'] as const;
  
	const chartData = [
		{
			range: '0.6 - 0.8',
			'0.01': 1000,
			'0.03': 1000,
      '0.05': 1000,
      '1': 1000,
		},
		{
			range: '[0.8, 1]',
			'0.01': 1000,
			'0.03': 1000,
      '0.05': 1000,
      '1': 1000,
		},
		{
			range: '[1, 1.2]',
			'0.01': 1000,
			'0.03': 1000,
      '0.05': 1000,
      '1': 1000,
		},
		{
			range: '[1.2, 1.4]',
			'0.01': 1000,
			'0.03': 1000,
      '0.05': 1000,
      '1': 1000,
		}
	];
	/*
	const chartConfig = {
		'0.01': { label: '0.01%', color: 'var(--chart-1)' },
		'0.03': { label: '0.03%', color: 'var(--chart-2)' },
    '0.05': { label: '0.03%', color: 'var(--chart-3)' },
    '1': { label: '0.03%', color: 'var(--chart-4)' }
	} satisfies Chart.ChartConfig;
  */
	const chartConfig = Object.fromEntries(
		FEE_TIERS.map((f, i) => {
      const fee = f.toString();
			const item = {
				label: `${fee}%`,
				color: `var(--chart-${i+1})`
			};

			return [fee, item];
		})
	);

  console.dir(chartConfig)

	let context = $state<ChartContextValue>();

	/*
    So how does this work?
    We've got a series of positions for a series of pools. "actually" these pools currently are for the same pair of assets on the the same dex. 
    Said pair has multiple fee schedules and that's what we're stacking here.

    So all in all:
      - We're expecting the data to be available as a series of boxes so we can split and compute the liquidity neat per box
      - the liquidity may actually be spread across the WHOLE spectrum so we'll want to cut off only to keep what makes sense around the center price
  */
	let midPrice = 1;
	let spread = 0.2; // We'll show off 20% around the centerprice
</script>

<Chart.Container config={chartConfig}>
	<BarChart
		bind:context
		data={chartData}
		xScale={scaleBand().padding(0.25)}
		x="range"
		axis="x"
		rule={false}
		series={[
			{
				key: '0.01',
				label: '0.01%',
				color: chartConfig['0.01'].color,
				props: { rounded: 'bottom' }
			},
			{
				key: '0.03',
				label: '0.03%',
				color: chartConfig['0.03'].color
			}
		]}
		seriesLayout="stack"
		props={{
			bars: {
				stroke: 'none',
				initialY: context?.height,
				initialHeight: 0,
				motion: {
					y: { type: 'tween', duration: 500, easing: cubicInOut },
					height: { type: 'tween', duration: 500, easing: cubicInOut }
				}
			},
			highlight: { area: false }
		}}
		legend
	>
		{#snippet belowMarks()}
			<Highlight area={{ class: 'fill-muted' }} />
		{/snippet}

		{#snippet tooltip()}
			<Chart.Tooltip />
		{/snippet}
	</BarChart>
</Chart.Container>
