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

export const load = (async ({ params }) => {
	// slug is built as tokenA-tokenB
	const [tokenASymbol, tokenBSymbol] = params.slug.split('-');
	if (!tokenASymbol || !tokenBSymbol) {
		throw new Error('Invalid slug format');
	}

	const tokenA = alias(tokensTable, 'tokenA');
	const tokenB = alias(tokensTable, 'tokenB');
	const pools = await db
		.select()
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
	//console.log(positions);
	// Now that we've got the positions, we'll want to group them by fee tier / actual poolID.
	const positionsPerPool: Record<string, typeof positionsTable.$inferSelect> = {};

	const assets = { tokenA: pools[0].tokenA, tokenB: pools[0].tokenB };

	const tapp = useTapp(useAptos(APTOS_KEY));

	const pool = pools[0];
	const poolInfo = await tapp.sdk.Pool.getInfo(pool.pools.id);
	const computedMidPrice = sqrtPriceToPrice({
		decimalsA: pool.tokenA.decimals,
		decimalsB: pool.tokenB.decimals,
		sqrtPrice: poolInfo.sqrtPrice
	});

	console.dir(computedMidPrice);
	return {
		assets,
		pools: pools.map((p) => p.pools),
		positions: positions.map((p) => {
			return { ...p, fee: parseFloat(p.fee) };
		}),
		liquidity: binLiquidity(0.965, positions)
	};
}) satisfies PageServerLoad;
