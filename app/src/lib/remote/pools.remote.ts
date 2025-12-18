import { query } from '$app/server';
import { db } from '$lib/server/db';
import { poolsTable, tokensTable } from '$lib/server/db/schema';
import { apiClient } from '$lib/shared/api';
import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export const getPools = query(async () => {
	// TODO: this really should be a normalized view or two simpler queries.
	const tokenA = alias(tokensTable, 'tokenA');
	const tokenB = alias(tokensTable, 'tokenB');

	const pools2 = await db
		.select({
			// Token pair information
			tokenA: {
				id: tokenA.id,
				symbol: tokenA.symbol,
				name: tokenA.name,
				about: tokenA.about,
				logo: tokenA.logo,
				decimals: tokenA.decimals
			},
			tokenB: {
				id: tokenB.id,
				symbol: tokenB.symbol,
				name: tokenB.name,
				about: tokenB.about,
				logo: tokenB.logo,
				decimals: tokenB.decimals
			},

			// Aggregated pool data as JSON
			poolDetails: sql<
				Array<{
					id: string;
					fee: string;
					dex: string;
					positionIndex: number;
					tradingAPR: number;
					bonusAPR: number;
					tvl: number;
					volumeDay: number;
					updatedAt: Date;
				}>
			>`
				json_agg(
					json_build_object(
						'id', ${poolsTable.id},
						'fee', ${poolsTable.fee},
						'dex', ${poolsTable.dex},
						'tradingAPR', ${poolsTable.tradingAPR},
						'bonusAPR', ${poolsTable.bonusAPR},
						'tvl', ${poolsTable.tvl},
						'volumeDay', ${poolsTable.volumeDay},
						'positionIndex', ${poolsTable.positionIndex},
						'updatedAt', ${poolsTable.updatedAt}
					)
				)
			`,

			// Summary statistics
			totalPools: sql<number>`count(*)`,
			uniqueFees: sql<string[]>`array_agg(DISTINCT ${poolsTable.fee})`,
			maxPositionIndex: sql<number>`max(${poolsTable.positionIndex})`
		})
		.from(poolsTable)
		.innerJoin(tokenA, eq(poolsTable.tokenA, tokenA.id))
		.innerJoin(tokenB, eq(poolsTable.tokenB, tokenB.id))
		.groupBy(
			tokenA.id,
			tokenA.symbol,
			tokenA.name,
			tokenA.about,
			tokenA.logo,
			tokenA.decimals,
			tokenB.id,
			tokenB.symbol,
			tokenB.name,
			tokenB.about,
			tokenB.logo,
			tokenB.decimals
		);

	return pools2;
});

export const getPoolsV1 = query(async () => {
	const pools = await apiClient.GET('/pools');


	return [pools.data];
});

export const getPool = query(async () => {});
