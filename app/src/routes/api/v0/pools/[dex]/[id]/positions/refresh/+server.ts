import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ALLOWED_DEXES } from '$lib/data/dexes';
import { db } from '$lib/server/db';
import { poolsTable, positionsTable } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { useAptos, useTapp } from '$lib/shared';
import { APTOS_KEY } from '$env/static/private';
import { convertTickBitsToSigned } from '$lib/utils';

function parseTickValue(tickBits: string): number {
	const tick = BigInt(tickBits);
	const MAX_U64 = BigInt('18446744073709551615'); // 2^64 - 1
	const MAX_I64 = BigInt('9223372036854775807'); // 2^63 - 1

	// If it's larger than max signed 64-bit, it's actually negative
	if (tick > MAX_I64) {
		return Number(tick - MAX_U64 - BigInt(1)); // Convert to negative
	}

	return Number(tick);
}



export const POST: RequestHandler = async ({ params }) => {
	const { dex, id } = params;

	if (!ALLOWED_DEXES.includes(dex)) {
		return json({
			status: 'error',
			message: `invalid dex name ${dex} - expected one of: ${ALLOWED_DEXES.join(',')}`
		});
	}

	// Check if pool exists in DB
	const [poolInfo] = await db.select().from(poolsTable).where(eq(poolsTable.id, id)).limit(1);
	if (!poolInfo) {
		return json({
			status: 'error',
			message: `pool not found for id: ${id}`
		});
	}

	const tapp = useTapp(useAptos(APTOS_KEY));
	const maximumIndex = await tapp.contract.getPositionCountFromPool(poolInfo.id);

	// TODO: try and get all existing positions using the dedicated contract query. It will fail when too many positions exist
	//const allPositions = await tapp.contract.getPositions(poolInfo.id);

	// Get all the positions we already know about and want to refresh
	const knownPositions = await db
		.select({ index: positionsTable.index })
		.from(positionsTable)
		.where(eq(positionsTable.pool, id));

	const indexesToRefresh = (knownPositions ?? []).map((k) => k.index);
	const maxKnown = Math.max(...indexesToRefresh, 0);
	const toFetch = Array.from({ length: maximumIndex - maxKnown }, (_, i) => maxKnown + i + 1);

	const positions = await tapp.contract.iterGetPositions(poolInfo.id, {
		maximumIndex: maximumIndex,
		indexes: [...indexesToRefresh, ...toFetch]
	});

	//console.dir(positions)

	const toUpsert: (typeof positionsTable.$inferInsert)[] = positions.positions.map((pos) => {
		return {
			index: parseInt(pos.index),
			pool: poolInfo.id,
			tickLower: convertTickBitsToSigned(BigInt(pos.tick_lower_index.bits)),
			tickUpper: convertTickBitsToSigned(BigInt(pos.tick_upper_index.bits)),
			liquidity: pos.liquidity,
			updatedAt: new Date()
		};
	});

	if (toUpsert.length > 0) {
		await db
			.insert(positionsTable)
			.values(toUpsert)
			.onConflictDoUpdate({
				target: [positionsTable.index, positionsTable.pool],
				set: {
					tickLower: sql`EXCLUDED.tick_lower`,
					tickUpper: sql`EXCLUDED.tick_upper`,
					liquidity: sql`EXCLUDED.liquidity`,
					updatedAt: sql`EXCLUDED.updated_at`
				}
			});

		return json({
			status: 'success',
			message: `refreshed positions for: ${params.dex}::${params.id}`
		});
	} else {
		return json({
			status: 'success',
			message: `No active position found for: ${params.dex}::${params.id}`
		});
	}
};
