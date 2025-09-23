import { TappAPI } from '$lib/shared/tapp';
import { json, type RequestHandler } from '@sveltejs/kit';
import { tokensTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ params }) => {
	// Need to namespace behind dex I suppose.
	const api = new TappAPI();

	// FIXME: pagesize is actually limited to 30, there's 31 tokens currently so we definitely need to get everything. 
	// NOTE: query is a bit slow, it might be preferable to just multicall?
	const tokens = await api.getTokenList({
        pageSize: 100
    });

	//const tokensUpsert: typeof token.$inferInsert = [];
	const toUpsert: (typeof tokensTable.$inferInsert)[] = tokens.map((tok) => {
		return {
			decimals: tok.decimals,
			id: tok.addr,
			symbol: tok.ticker,
			logo: tok.img,
			name: tok.name
		};
	});

	// TODO: we're not currently saving token prices and change
	await db
		.insert(tokensTable)
		.values(toUpsert)
		.onConflictDoUpdate({
			target: tokensTable.id,
			set: {
				name: tokensTable.name
			}
		});

	return json({
		status: 'success',
		content: `Updated ${tokens.length} tokens`
	});
};
