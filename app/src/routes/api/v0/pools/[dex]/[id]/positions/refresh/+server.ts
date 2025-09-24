import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ALLOWED_DEXES } from '$lib/data/dexes';
import { db } from '$lib/server/db';
import { poolsTable, positionsTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { useAptos, useTapp } from '$lib/shared';

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

	const tapp = useTapp(useAptos());
	const maximumIndex = await tapp.contract.getPositionCountFromPool(poolInfo.id);
	//console.log('info', info);
	const positions = await tapp.contract.iterGetPositions(poolInfo.id, {
		maximumIndex: maximumIndex
	});

	console.dir(positions);

	const toUpsert: (typeof positionsTable.$inferInsert)[] = positions.positions.map((pos) => {
		return {
			index: pos.index,
			pool: poolInfo.id,
			updatedAt: new Date(),
		};
	});

	db.insert(positionsTable).values();
	// First we try getting all positions
	//tapp.contract.getPositions()
	//console.dir(poolInfo);

	return json({
		status: 'success',
		message: `refreshed positions for: ${params.dex}::${params.id}`
	});
};
