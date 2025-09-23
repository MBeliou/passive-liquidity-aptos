import { query } from '$app/server';
import type { TokenListResponse } from '$lib/types/token-list';
import { z } from 'zod';

/* Vaults is what we're running, we're building on top of tapp's pools */
export const getVaults = query(async () => {
	return [];
});

export const getAssets = query(async () => {
	try {
		const url = 'https://assets.hyperion.xyz/files/token-list.json?t=58618136';
		const response = await fetch(url);

		const json = (await response.json()) as TokenListResponse;

		return json.data;
	} catch (error) {
		return [];
	}
});

export const getAsset = query(z.string(), async (address) => {
	return null;
});
