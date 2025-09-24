import { query } from '$app/server';
import { db } from '$lib/server/db';
import { poolsTable, tokensTable } from '$lib/server/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
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

	console.dir(pools, { depth: 5 });
	return pools;
});
