import { binLiquidity } from '$lib/components/app/charts/pool/utils';
//import { binLiquidity } from '$lib/components/app/charts/pool/pool-chart.svelte';
import { db } from '$lib/server/db';
import { poolsTable, positionsTable, tokensTable } from '$lib/server/db/schema';
import { eq, and, ilike, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { PageServerLoad } from './$types';
import { useAptos, useTapp } from '$lib/shared';
import { APTOS_KEY } from '$env/static/private';
import { sqrtPriceToPrice } from '$lib/shared/tapp/utils';
import { TappAPI } from '$lib/shared/tapp';
import { analyzeVolatility } from '$lib/server/volatility';

function dateToTimestamp(date: Date) {
	return Math.floor(date.getTime());
}

export const load = (async ({ params }) => {
	// slug is built as tokenA-tokenB
	const [tokenASymbol, tokenBSymbol] = params.slug.split('-');
	if (!tokenASymbol || !tokenBSymbol) {
		throw new Error('Invalid slug format');
	}

	const tokenA = alias(tokensTable, 'tokenA');
	const tokenB = alias(tokensTable, 'tokenB');
	const pools = await db
		.select({
			pools: poolsTable,
			tokenA: tokenA,
			tokenB: tokenB
		})
		.from(poolsTable)
		.innerJoin(tokenA, eq(poolsTable.tokenA, tokenA.id))
		.innerJoin(tokenB, eq(poolsTable.tokenB, tokenB.id))
		.where(and(ilike(tokenA.symbol, tokenASymbol), ilike(tokenB.symbol, tokenBSymbol)));

	const positions = (
		await db
			.select({
				tickLower: positionsTable.tickLower,
				tickUpper: positionsTable.tickUpper,
				liquidity: positionsTable.liquidity,
				fee: poolsTable.fee
			})
			.from(positionsTable)
			.innerJoin(poolsTable, eq(poolsTable.id, positionsTable.pool))
			.where(
				inArray(
					positionsTable.pool,
					pools.map((p) => p.pools.id)
				)
			)
	).map((p) => {
		return {
			...p,
			fee: parseFloat(p.fee)
		};
	});
	const assets = { tokenA: pools[0].tokenA, tokenB: pools[0].tokenB };

	const tapp = useTapp(useAptos(APTOS_KEY));

	const pool = pools[0];
	const poolInfo = await tapp.sdk.Pool.getInfo(pool.pools.id);
	const computedMidPrice = sqrtPriceToPrice({
		decimalsA: pool.tokenA.decimals,
		decimalsB: pool.tokenB.decimals,
		sqrtPrice: poolInfo.sqrtPrice
	});

	const binnedLiquidity = binLiquidity(computedMidPrice, positions, {
		delta: 10,
		bins: 10
	});

	// Compute full liquidity distribution and position counts per fee tier
	const liquidityTotals: Record<string, number> = {};
	const positionCounts: Record<string, number> = {};
	positions.forEach((pos) => {
		const feeKey = pos.fee.toString();
		const liquidityAmount = parseFloat(pos.liquidity);
		if (!liquidityTotals[feeKey]) {
			liquidityTotals[feeKey] = 0;
			positionCounts[feeKey] = 0;
		}
		liquidityTotals[feeKey] += liquidityAmount;
		positionCounts[feeKey]++;
	});

	const totalLiquidity = Object.values(liquidityTotals).reduce((sum, val) => sum + val, 0);
	const liquidityDistribution: Record<string, number> = {};
	Object.entries(liquidityTotals).forEach(([feeKey, amount]) => {
		liquidityDistribution[feeKey] = totalLiquidity > 0 ? (amount / totalLiquidity) * 100 : 0;
	});

	// Compute in-range liquidity distribution and position counts per fee tier
	const tickToPrice = (tick: number): number => Math.pow(1.0001, tick);
	const delta = 10;
	const rangeMin = computedMidPrice * (1 - delta / 100);
	const rangeMax = computedMidPrice * (1 + delta / 100);

	const inRangeLiquidityTotals: Record<string, number> = {};
	const inRangePositionCounts: Record<string, number> = {};
	positions.forEach((pos) => {
		const lowerPrice = tickToPrice(pos.tickLower);
		const upperPrice = tickToPrice(pos.tickUpper);

		if (upperPrice >= rangeMin && lowerPrice <= rangeMax) {
			const feeKey = pos.fee.toString();
			const liquidityAmount = parseFloat(pos.liquidity);
			if (!inRangeLiquidityTotals[feeKey]) {
				inRangeLiquidityTotals[feeKey] = 0;
				inRangePositionCounts[feeKey] = 0;
			}
			inRangeLiquidityTotals[feeKey] += liquidityAmount;
			inRangePositionCounts[feeKey]++;
		}
	});

	const totalInRangeLiquidity = Object.values(inRangeLiquidityTotals).reduce(
		(sum, val) => sum + val,
		0
	);
	const inRangeLiquidityDistribution: Record<string, number> = {};
	Object.entries(inRangeLiquidityTotals).forEach(([feeKey, amount]) => {
		inRangeLiquidityDistribution[feeKey] =
			totalInRangeLiquidity > 0 ? (amount / totalInRangeLiquidity) * 100 : 0;
	});

	const tappAPI = new TappAPI();
	const now = new Date();
	const lastWeek = new Date();
	lastWeek.setDate(now.getDate() - 7);

	const prices = await tappAPI.getPoolPrices(
		pool.pools.id,
		dateToTimestamp(lastWeek),
		dateToTimestamp(now),
		'1h'
	);

	const volatility = analyzeVolatility(prices);

	// Calculate aggregate metrics
	const totalVolume = pools.reduce((sum, p) => sum + p.pools.volumeDay, 0);
	const totalVolumePrevDay = pools.reduce((sum, p) => sum + p.pools.volumePrevDay, 0);
	const totalTVL = pools.reduce((sum, p) => sum + p.pools.tvl, 0);

	const aprValues = pools.map((p) => p.pools.tradingAPR + p.pools.bonusAPR);
	const minAPR = aprValues.length > 0 ? Math.min(...aprValues) : 0;
	const maxAPR = aprValues.length > 0 ? Math.max(...aprValues) : 0;

	const volumeChange =
		totalVolumePrevDay > 0 ? ((totalVolume - totalVolumePrevDay) / totalVolumePrevDay) * 100 : 0;
	const usedLiquidityPercent = totalLiquidity > 0 ? (totalInRangeLiquidity / totalLiquidity) * 100 : 0;

	const hasBonus = pools.some((p) => p.pools.bonusAPR > 0);

	// Calculate position dollar values
	const positionsWithValue = positions.map((p) => {
		const liquidityAmount = parseFloat(p.liquidity);
		const valueUSD = totalLiquidity > 0 ? (liquidityAmount / totalLiquidity) * totalTVL : 0;
		return {
			...p,
			fee: parseFloat(p.fee),
			valueUSD
		};
	});

	return {
		assets,
		pools: pools.map((p) => p.pools),
		positions: positionsWithValue,
		liquidity: binnedLiquidity,
		prices,
		volatility,
		poolMetrics: {
			totalVolume,
			totalTVL,
			minAPR,
			maxAPR,
			volumeChange,
			usedLiquidityPercent
		},
		hasBonus,
		about: {
			liquidityDistribution,
			inRangeLiquidityDistribution,
			positionCounts,
			inRangePositionCounts
		}
	};
}) satisfies PageServerLoad;
