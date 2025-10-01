import { useAptos, useTapp } from '$lib/shared';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const tapp = useTapp(useAptos());

	const poolID = '0x4ed8fda291b604491ead0cc9e5232bc1edc1f31d0e0cf343be043d8c792af1a8';
	const contractPosition = await tapp.contract.getPosition(poolID, 3249);
	const positions = await tapp.sdk.Position.getPositions({
		userAddr: '0x15b0ba37d2fc91c1ea881c58b24c45389612f4ea8495bbfda8c899de18e24fa0'
	});

	const relevantPosition = positions.data.find((p) => (p.poolId = poolID));

	return json({ contractPosition, position: relevantPosition });
};
