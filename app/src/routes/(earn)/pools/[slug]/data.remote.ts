import { query } from '$app/server';
import { db } from '$lib/server/db';
import { poolsTable, positionsTable, tokensTable } from '$lib/server/db/schema';
import { eq, and, ilike, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const getAggregatePoolInfo = query(z.string(), async (slug: string) => {
	// slug is built as tokenA-tokenB
	const [tokenASymbol, tokenBSymbol] = slug.split('-');
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

	const positions = await db
		.select()
		.from(positionsTable)
		.where(
			inArray(
				positionsTable.pool,
				pools.map((p) => p.pools.id)
			)
		);

	console.dir(positions);

	return pools;
});
