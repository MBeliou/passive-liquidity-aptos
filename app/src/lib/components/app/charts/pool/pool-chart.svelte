<script lang="ts" module>
	export type ChartData = {
		range: string;
	} & Record<Fee, number>;

	export function makeFeeLabel(fee: Fee) {
		return `${parseFloat(fee).toFixed(2)}%`;
	}

	export function formatRange(range: number[]) {
		return `[${range[0].toFixed(2)}-${range[1].toFixed(2)}[`;
	}

	export function normalizeFeeTier(fee: Fee) {
		return parseFloat(fee).toFixed(2);
	}
</script>

<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { scaleBand } from 'd3-scale';
	import { BarChart, Highlight, type ChartContextValue } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';
	import { FEE_TIERS, type Fee } from './utils';

	/*
    So how does this work?
    We've got a series of positions for a series of pools. "actually" these pools currently are for the same pair of assets on the the same dex. 
    Said pair has multiple fee schedules and that's what we're stacking here.

    So all in all:
      - We're expecting the data to be available as a series of boxes so we can split and compute the liquidity neat per box
      - the liquidity may actually be spread across the WHOLE spectrum so we'll want to cut off only to keep what makes sense around the center price


    We can do this by:
      - Getting the midPrice as current price
      - Allow setting a number of steps for binning
      - Allow setting a spread
      - Ratio-ing liquidity that's not in our price target. We can consider liquidity in a position to be evenly spread.
      - Binning what remains
      - Show off
    
      We'll be able to just recompute data reactively. I'm not expecting "too much" performance problems given the liquidity on Tapp. Looks like at most 3000 positions which is more than ok.
  */
	let { chartData }: { chartData: ChartData[] } = $props();
	const chartConfig = Object.fromEntries(
		FEE_TIERS.map((f, i) => {
			const item = {
				label: makeFeeLabel(f),
				color: `var(--chart-${i + 1})`
			};

			return [f, item];
		})
	);

	const series = FEE_TIERS.map((f) => {
		return {
			key: normalizeFeeTier(f),
			label: makeFeeLabel(f),
			color: chartConfig[f].color
		};
	});

	let context = $state<ChartContextValue>();
</script>

<Chart.Container config={chartConfig}>
	<BarChart
		bind:context
		data={chartData}
		xScale={scaleBand().padding(0.05)}
		x="range"
		axis="x"
		rule={false}
		{series}
		seriesLayout="stack"
		props={{
			bars: {
				stroke: 'none',
				radius: 0,
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
