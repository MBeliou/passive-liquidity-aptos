import { ALLOWED_DEXES } from '$lib/data/dexes';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { useTapp } from '$lib/shared/tapp/sdk';
import { useAptos } from '$lib/shared';
import { PoolType } from '@tapp-exchange/sdk';
import { poolsTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import type { TappApiApr } from '$lib/shared/tapp/types';

export const POST: RequestHandler = async ({ params }) => {
	const { dex, id } = params;

	if (!ALLOWED_DEXES.includes(dex)) {
		return json({
			status: 'error',
			message: `invalid dex name ${dex} - expected one of: ${ALLOWED_DEXES.join(',')}`
		});
	}

	const tapp = useTapp(useAptos());

	// We'll be getting the 100 top pools by TVL. There are only around 40 concentrated pools atm
	const poolsPerPage = 10;
	const totalPages = 10;

	const poolPromises = Array.from({ length: totalPages }, (_, index) => {
		const page = index + 1;
		return tapp.sdk.Pool.getPools({
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

	

	const poolsUpsert: (typeof poolsTable.$inferInsert)[] = allPools.map((pool) => {
		// NOTE: Tapp's sdk return type is wrong for APR
		// We're not concerned by the campaign details
		const apr = pool.apr as unknown as TappApiApr;

		return {
			id: pool.poolId,
			dex: dex,
			fee: pool.feeTier,
			tradingAPR: apr.feeAprPercentage,
			bonusAPR: apr.boostedAprPercentage,
			volumeDay: pool.volumeData.volume24h,
			volumeWeek: pool.volumeData.volume7d,
			volumeMonth: pool.volumeData.volume30d,
			volumePrevDay: pool.volumeData.volumeprev24h,
			tokenA: pool.tokens[0].addr,
			tokenB: pool.tokens[1].addr,
			updatedAt: new Date()
		};
	});

	await db
		.insert(poolsTable)
		.values(poolsUpsert)
		.onConflictDoUpdate({
			target: poolsTable.id,
			/*set: {
				fee: poolsTable.fee
			}*/
			set: {
				fee: sql`excluded.fee`,
				tradingAPR: sql`excluded.tradingAPR`,
				bonusAPR: sql`excluded.bonusAPR`
			}
		});

	return json({
		status: 'success',
		message: `Refreshed ${allPools.length} pools`
	});
};
