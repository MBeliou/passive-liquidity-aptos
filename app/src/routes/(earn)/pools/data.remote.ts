import { query } from '$app/server';
import { db } from '$lib/server/db';
import { poolsTable, tokensTable } from '$lib/server/db/schema';
import { useTapp } from '$lib/shared/tapp/sdk';
import { PoolType } from '@tapp-exchange/sdk';
import { eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export const getPools = query(async () => {
	const tokenA = alias(tokensTable, 'tokenA');
	const tokenB = alias(tokensTable, 'tokenB');
	const pools = await db
		.select()
		.from(poolsTable)
		.innerJoin(tokenA, eq(poolsTable.tokenA, tokenA.id))
		.innerJoin(tokenB, eq(poolsTable.tokenB, tokenB.id));

	const pools2 = await db
		.select({
			// Token pair information
			tokenA: {
				id: tokenA.id,
				symbol: tokenA.symbol,
				name: tokenA.name,
				about: tokenA.about,
				logo: tokenA.logo,
				decimals: tokenA.decimals,
			},
			tokenB: {
				id: tokenB.id,
				symbol: tokenB.symbol,
				name: tokenB.name,
				about: tokenB.about,
				logo: tokenB.logo,
				decimals: tokenB.decimals,
			},
			
			// Aggregated pool data as JSON
			poolDetails: sql<Array<{
				id: string;
				fee: string;
				dex: string;
				positionIndex: number;
				updatedAt: Date;
			}>>`
				json_agg(
					json_build_object(
						'id', ${poolsTable.id},
						'fee', ${poolsTable.fee},
						'dex', ${poolsTable.dex},
						'positionIndex', ${poolsTable.positionIndex},
						'updatedAt', ${poolsTable.updatedAt}
					)
				)
			`,
			
			// Summary statistics
			totalPools: sql<number>`count(*)`,
			uniqueFees: sql<string[]>`array_agg(DISTINCT ${poolsTable.fee})`,
			maxPositionIndex: sql<number>`max(${poolsTable.positionIndex})`,
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
			tokenB.decimals,
		);

		console.dir(pools2, {depth: 5});

	return pools2;
});

export const getTappPools = query(async () => {
	try {
		// We'll be getting the 100 top pools by TVL. There are only around 40 concentrated pools
		const poolsPerPage = 10;
		const totalPages = 10;

		const poolPromises = Array.from({ length: totalPages }, (_, index) => {
			const page = index + 1;
			return useTapp().Pool.getPools({
				type: PoolType.CLMM,
				sortBy: 'tvl',
				size: poolsPerPage,
				page: page
			});
		});

		const results = await Promise.allSettled(poolPromises);
		const allPools = results
			.filter((result) => result.status === 'fulfilled' && result.value?.data)
			.flatMap(
				(result) =>
					(result as PromiseFulfilledResult<Awaited<(typeof poolPromises)[number]>>).value.data
			);
		console.log(`found ${allPools.length} pools`);
		console.dir(allPools);

		const poolsByTokenPair = allPools.reduce(
			(acc, pool) => {
				if (pool.tokens && pool.tokens.length >= 2) {
					const tokenPairKey = `${pool.tokens[0].symbol}-${pool.tokens[1].symbol}`;

					if (!acc[tokenPairKey]) {
						acc[tokenPairKey] = [];
					}

					acc[tokenPairKey].push(pool);
				}
				return acc;
			},
			{} as Record<string, typeof allPools>
		);

		//console.log(JSON.stringify(allPools))

		// FIXME, typing is wrong on APR
		/*
            {"boostedAprPercentage":163.4867960072121,"campaignAprs":[{"aprPercentage":163.4867960072121,"campaignIdx":10,"token":{"addr":"0x000000000000000000000000000000000000000000000000000000000000000a","color":"#FFFFFF","decimals":8,"img":"https://cdn.prod.tapp-dex.devucc.name/token-logos/apt.svg","symbol":"APT","verified":true}}],"feeAprPercentage":17.851670425136415,"totalAprPercentage":181.3384664323485}
        */

		return poolsByTokenPair;
	} catch (error) {
		console.error('error', error);
		return [];
	}
});
