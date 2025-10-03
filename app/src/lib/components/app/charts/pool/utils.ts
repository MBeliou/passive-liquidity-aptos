import type { positionsTable } from '$lib/server/db/schema';
import { formatRange, normalizeFeeTier, type ChartData } from './pool-chart.svelte';

export const FEE_TIERS = ['0.01', '0.3', '0.05', '1'] as const;
export type Fee = (typeof FEE_TIERS)[number];

export type PositionWithFee = typeof positionsTable.$inferSelect & {
	fee: number; // fee in bps (e.g., 500 for 0.05%, 3000 for 0.30%)
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

	const tickToPrice = (tick: number): number => {
		return Math.pow(1.0001, tick);
	};

	const priceToTick = (price: number): number => {
		return Math.log(price) / Math.log(1.0001);
	};
	/*
	const getFeeLabel = (feeBps: number): string => {
		return `${feeBps.toFixed(3)}%`;
	};*/

	const rangeMin = midPrice * (1 - delta / 100);
	const rangeMax = midPrice * (1 + delta / 100);

	const inRangePositions = positions.filter((pos) => {
		const lowerPrice = tickToPrice(pos.tickLower);
		const upperPrice = tickToPrice(pos.tickUpper);
		return upperPrice >= rangeMin && lowerPrice <= rangeMax;
	});

	const binWidth = (rangeMax - rangeMin) / bins;
	const binRanges: [number, number][] = [];
	for (let i = 0; i < bins; i++) {
		binRanges.push([rangeMin + i * binWidth, rangeMin + (i + 1) * binWidth]);
	}

	const result = binRanges.map((range) => ({
		range,
		...({} as Record<string, number>)
	}));

	inRangePositions.forEach((pos) => {
		const lowerPrice = tickToPrice(pos.tickLower);
		const upperPrice = tickToPrice(pos.tickUpper);
		//const feeLabel = makeFeeLabel(pos.fee);
		const feeLabel = pos.fee.toString();
		const liquidityAmount = parseFloat(pos.liquidity);

		binRanges.forEach((binRange, idx) => {
			const [binMin, binMax] = binRange;

			if (upperPrice >= binMin && lowerPrice <= binMax) {
				if (!result[idx][feeLabel]) {
					result[idx][feeLabel] = 0;
				}
				result[idx][feeLabel] += liquidityAmount;
			}
		});
	});

	const typedResult: ChartData[] = [];
	result.forEach((r) => {
		const range = formatRange(r.range);

		const feeAccumulator: Record<string, number> = {};
		FEE_TIERS.forEach((tier) => {
			const formattedTier = normalizeFeeTier(tier);
			// @ts-expect-error Typescript resolves earlier ...({}) as never so that gets gutted out
			const liquidity = r[tier] ?? 0;
			feeAccumulator[formattedTier] = liquidity;
		});

		typedResult.push({ range, ...feeAccumulator });
	});

	//return result;
	return typedResult;
}
