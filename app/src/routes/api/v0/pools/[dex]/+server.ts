import { ALLOWED_DEXES } from '$lib/data/dexes';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { useTapp } from '$lib/shared/tapp/sdk';
import { useAptos } from '$lib/shared';
import { PoolType } from '@tapp-exchange/sdk';

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

	return json({
		status: 'success',
		message: `Refreshed ${allPools.length} pools`
	});
};
