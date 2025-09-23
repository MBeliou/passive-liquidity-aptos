import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ALLOWED_DEXES } from '$lib/data/dexes';

export const POST: RequestHandler = async ({ params }) => {
	const { dex, id } = params;
	

	if (ALLOWED_DEXES.includes(dex)) {
		return json({
			status: 'success',
			message: `refreshed ${params.dex} pool: ${params.id}`
		});
	} else {
		return json({
			status: 'error',
			message: `invalid dex name ${dex} - expected one of: ${ALLOWED_DEXES.join(',')}`
		});
	}
};
