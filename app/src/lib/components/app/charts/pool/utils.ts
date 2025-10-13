import type { positionsTable } from '$lib/server/db/schema';
import { formatRange, normalizeFeeTier, type ChartData } from './pool-chart.svelte';

export const FEE_TIERS = ['0.01', '0.3', '0.05', '1'] as const;
export type Fee = (typeof FEE_TIERS)[number];

export type PositionWithFee = typeof positionsTable.$inferSelect & {
	fee: number; // fee in bps (e.g., 500 for 0.05%, 3000 for 0.30%)
};

export const tickToPrice = (tick: number): number => {
	return Math.pow(1.0001, tick);
};

/**
 * Bins and ratios the liquidity from positions depending on the midPrice
 * @param midPrice
 * @param positions
 * @param [options={ bins: 10, delta: 20 }] - Sets how many bins we want and how far we want the spread to be (as %, eg [-20%; +20%])
 */
export function binLiquidity(
	midPrice: number,
	positions: PositionWithFee[],
	options = { bins: 20, delta: 5 }
) {
	const { bins, delta } = options;

	const rangeMin = midPrice * (1 - delta / 100);
	const rangeMax = midPrice * (1 + delta / 100);
	const viewingWidth = rangeMax - rangeMin;

	const binWidth = viewingWidth / bins;
	const binRanges: [number, number][] = [];
	for (let i = 0; i < bins; i++) {
		binRanges.push([rangeMin + i * binWidth, rangeMin + (i + 1) * binWidth]);
	}

	const result = binRanges.map((range) => ({
		range,
		...({} as Record<string, number>)
	}));

	const p = positions.map((pos) => {
		const lowerPrice = tickToPrice(pos.tickLower);
		const upperPrice = tickToPrice(pos.tickUpper);

		return {
			...pos,
			lowerPrice,
			upperPrice
		};
	});

	p.filter((pos) => {
		return true;
		//return pos.lowerPrice > 1 ;
	}).map((pos) => {
		console.log(
			`position: ${pos.index} [${pos.lowerPrice} - ${pos.upperPrice}], ticks: [${pos.tickLower} - ${pos.tickUpper}], liquidity: ${pos.liquidity}`
		);
	});

	binRanges.forEach((binRange, idx) => {
		const [binMin, binMax] = binRange;

		positions.forEach((pos) => {
			const lowerPrice = tickToPrice(pos.tickLower);
			const upperPrice = tickToPrice(pos.tickUpper);

			const feeLabel = pos.fee.toString();

			const hasOverlap = binMax > lowerPrice && binMin < upperPrice;

			if (hasOverlap) {
				const liquidityAmount = parseFloat(pos.liquidity);

				// Calculate how much of this bin the position actually covers
				const overlapStart = Math.max(binMin, lowerPrice);
				const overlapEnd = Math.min(binMax, upperPrice);
				const overlapWidth = overlapEnd - overlapStart;

				// Weight by overlap proportion AND inverse of position width
				const positionWidth = upperPrice - lowerPrice;

				//const densityFactor = 1 / positionWidth;
				//const contributedLiquidity = liquidityAmount * densityFactor * (overlapWidth / binWidth);
				const contributedLiquidity = liquidityAmount * (overlapWidth / positionWidth);

				if (!result[idx][feeLabel]) {
					result[idx][feeLabel] = 0;
				}
				result[idx][feeLabel] += contributedLiquidity;
			}
		});
	});

	const typedResult: ChartData[] = [];
	result.forEach((r) => {
		const range = formatRange(r.range);
		const feeAccumulator: Record<string, number> = {};

		FEE_TIERS.forEach((tier) => {
			const formattedTier = normalizeFeeTier(tier);
			// @ts-expect-error typescript too harsh
			const liquidity = r[tier] ?? 0;
			feeAccumulator[formattedTier] = liquidity;
		});

		typedResult.push({ range, ...feeAccumulator });
	});
	//console.dir(typedResult);

	return typedResult;
}
