import { query } from '$app/server';
import type { MesoResponse } from './meso.types';
import type { Data } from './money-market.types';
import type { MoneyMarket } from './shared';

const ECHELON_API_ENDPOINT = 'https://app.echelon.market/api/markets?network=aptos_mainnet';


/**
 * Normalized Market type
 */
export type Market = {
	/** Percentage: 0.11 => 11% */
	borrowApr: number;
	supplyApr: number;
	detailsUrl?: string;

	// Supply info later on so we know if the market's actually usable
};

export type AssetMarket = {
	name: string;
	symbol: string;
	icon: string;
	price: number;


	markets: Record<MoneyMarket, Market>;
};

const makeEchelonMarketUrl = (market: string) =>
	`https://app.echelon.market/market/${market}?network=aptos_mainnet`;

// TODO: migrate to data layer
export const getEchelonMarkets = query(async () => {
	const response = await fetch(ECHELON_API_ENDPOINT);
	const {
		data: { assets }
	}: { data: Data } = await response.json();

	return assets.map((a) => {
		return {
			name: a.name,
			tokenAddress: a.address,
			symbol: a.symbol,
			icon: a.icon,
			price: a.price,
			marketUrl: makeEchelonMarketUrl(a.market),
			supplyApr: a.supplyApr,
			borrowApr: a.borrowApr
		};
	});
});

const MESO_API_ENDPOINT = 'https://api.meso.finance/api/v1/pool?page=1&limit=1000';
const makeMesoMarketUrl = (assetAddress: string) => {
	return `https://app.meso.finance/asset/${assetAddress}`;
};
// TODO: migrate to data layer
export const getMesoMarkets = query(async () => {
	const response = await fetch(MESO_API_ENDPOINT);
	// Not enough pools to require iterating
	const { datas }: MesoResponse = await response.json();

	return datas.map((d) => {
		return {
			name: d.token.name,
			tokenAddress: d.tokenAddress,
			symbol: d.token.symbol,
			price: d.token.price,
			icon: d.token.icon_uri,
			marketUrl: makeMesoMarketUrl(d.tokenAddress),
			supplyApr: d.supplyApy,
			borrowApr: d.borrowApy
		};
	});
});

/**
 * Implements a common query for all markets. Normalizes tokens, markets and rates.
 */
export const getMarkets = query(async () => {
	const echelon = await getEchelonMarkets();
	const meso = await getMesoMarkets();

	// NOTE: there aren't too many markets altogether. Just iterate for simplicity.

	// Get all unique token addresses and filter out the assets with no addresses.
	const tokenAddresses = [
		...new Set(
			[...echelon, ...meso]
				.filter((a) => a.tokenAddress)
				.map((a) => {
					return a.tokenAddress;
				})
		)
	] as string[];

	return tokenAddresses.map((address) => {
		const echelonMarket = echelon.find((market) => market.tokenAddress === address);
		const mesoMarket = meso.find((market) => market.tokenAddress === address);

		const assetMarket = {
			name: echelonMarket?.name || mesoMarket?.name,
			symbol: echelonMarket?.symbol || mesoMarket?.symbol,
			icon: echelonMarket?.icon || mesoMarket?.icon,
			price: echelonMarket?.price || mesoMarket?.price,
			markets: {}
		} as AssetMarket;
		if (echelonMarket) {
			assetMarket.markets['echelon'] = {
				borrowApr: echelonMarket.borrowApr,
				supplyApr: echelonMarket.supplyApr,
				detailsUrl: echelonMarket.marketUrl
			};
		}
		if (mesoMarket) {
			assetMarket.markets['meso'] = {
				borrowApr: mesoMarket.borrowApr /100,
				supplyApr: mesoMarket.supplyApr /100,
				detailsUrl: mesoMarket.marketUrl
			};
		}

		return assetMarket;
	});
});
