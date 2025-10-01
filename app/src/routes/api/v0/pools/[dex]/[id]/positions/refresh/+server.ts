import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ALLOWED_DEXES } from '$lib/data/dexes';
import { db } from '$lib/server/db';
import { poolsTable, positionsTable } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { useAptos, useTapp } from '$lib/shared';
import { APTOS_KEY } from '$env/static/private';

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
	//console.log('info', info);
	const positions = await tapp.contract.iterGetPositions(poolInfo.id, {
		maximumIndex: maximumIndex
	});

	console.dir(positions, { depth: 4 });

	const toUpsert: (typeof positionsTable.$inferInsert)[] = positions.positions.map((pos) => {
		return {
			index: parseInt(pos.index),
			pool: poolInfo.id,
			tickLower: parseTickValue(pos.tick_lower_index.bits),
			tickUpper: parseTickValue(pos.tick_upper_index.bits),
			liquidity: pos.liquidity,
			updatedAt: new Date()
		};
	});

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
	// First we try getting all positions
	//tapp.contract.getPositions()
	//console.dir(poolInfo);

	return json({
		status: 'success',
		message: `refreshed positions for: ${params.dex}::${params.id}`
	});
};
