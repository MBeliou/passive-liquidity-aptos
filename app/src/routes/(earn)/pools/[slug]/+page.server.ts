import { binLiquidity } from '$lib/components/app/charts/pool/utils';
//import { binLiquidity } from '$lib/components/app/charts/pool/pool-chart.svelte';
import { db } from '$lib/server/db';
import { poolsTable, positionsTable, tokensTable } from '$lib/server/db/schema';
import { eq, and, ilike, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { PageServerLoad } from './$types';

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
		//.innerJoin(positionsTable, eq(poolsTable.id, positionsTable.pool))
		.where(and(ilike(tokenA.symbol, tokenASymbol), ilike(tokenB.symbol, tokenBSymbol)));
	/*
	const positions = await db
		.select()
		.from(positionsTable)
		.innerJoin(poolsTable, eq(poolsTable.id, positionsTable.pool))
		.where(
			inArray(
				positionsTable.pool,
				pools.map((p) => p.pools.id)
			)
		);

	console.dir(positions);

	return { pools, positions };*/
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

	console.dir(positions)
	return {
		assets,
		pools: pools.map((p) => p.pools),
		positions: positions.map((p) => {
			return { ...p, fee: parseFloat(p.fee) };
		}),
		liquidity: binLiquidity(0.965, positions)
	};
}) satisfies PageServerLoad;
