import { query } from '$app/server';
import { useTapp } from '$lib/shared/tapp-sdk';
import { PoolType } from '@tapp-exchange/sdk';

export const getTappPools = query(async () => {
	try {
		// We'll be getting the 100 top pools by TVL. There are only around 40 concentrated pools
		const poolsPerPage = 10;
		const totalPages = 10;

        

		const poolPromises = Array.from({ length: totalPages }, (_, index) => {
			const page = index + 1;
			return useTapp().Pool.getPools({
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

		const poolsByTokenPair = allPools.reduce(
			(acc, pool) => {
				if (pool.tokens && pool.tokens.length >= 2) {
					const tokenPairKey = `${pool.tokens[0].symbol}-${pool.tokens[1].symbol}`;

					if (!acc[tokenPairKey]) {
						acc[tokenPairKey] = [];
					}

					acc[tokenPairKey].push(pool);
				}
				return acc;
			},
			{} as Record<string, typeof allPools>
		);

        //console.log(JSON.stringify(allPools))

		// FIXME, typing is wrong on APR
		/*
            {"boostedAprPercentage":163.4867960072121,"campaignAprs":[{"aprPercentage":163.4867960072121,"campaignIdx":10,"token":{"addr":"0x000000000000000000000000000000000000000000000000000000000000000a","color":"#FFFFFF","decimals":8,"img":"https://cdn.prod.tapp-dex.devucc.name/token-logos/apt.svg","symbol":"APT","verified":true}}],"feeAprPercentage":17.851670425136415,"totalAprPercentage":181.3384664323485}
        */

		return poolsByTokenPair;
	} catch (error) {
		console.error('error', error);
		return [];
	}
});
