import { query } from '$app/server';
import type { Data } from './money-market.types';

const ECHELON_API_ENDPOINT = 'https://app.echelon.market/api/markets?network=aptos_mainnet';

export const getEchelonMarkets = query(async () => {
	const response = await fetch(ECHELON_API_ENDPOINT);
	const {
		data: { assets }
	}: { data: Data } = await response.json();

	return assets;
});
