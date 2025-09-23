import { TappAPI } from '$lib/shared/tapp';
import { json, type RequestHandler } from '@sveltejs/kit';
import { token } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ params }) => {
	// Need to namespace behind dex I suppose.
	const api = new TappAPI();

	const tokens = await api.getTokenList({
        pageSize: 100
    });

	//const tokensUpsert: typeof token.$inferInsert = [];
	const toUpsert: (typeof token.$inferInsert)[] = tokens.map((tok) => {
		return {
			decimals: tok.decimals,
			id: tok.addr,
			symbol: tok.ticker,
			logo: tok.img,
			name: tok.name
		};
	});

	await db
		.insert(token)
		.values(toUpsert)
		.onConflictDoUpdate({
			target: token.id,
			set: {
				name: token.name
			}
		});

	return json({
		status: 'success',
		content: `Updated ${tokens.length} tokens`
	});
};
