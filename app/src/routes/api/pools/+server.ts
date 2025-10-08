import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { useTapp } from '$lib/shared/tapp/sdk';
import { PoolType } from '@tapp-exchange/sdk';
import { useAptos } from '$lib/shared';

export const GET: RequestHandler = async () => {
	console.log('received');
	const tapp = useTapp(useAptos());
	/*
	const info = await tapp.Pool.getInfo(
		'0x3d326fbff259240ef018f69bb72a90a71e800e982c496d34c27882fcd83a5b4d'
	);*/

	const pools = await tapp.sdk.Pool.getPools({
		type: PoolType.CLMM
	});


	return json(pools);
};
