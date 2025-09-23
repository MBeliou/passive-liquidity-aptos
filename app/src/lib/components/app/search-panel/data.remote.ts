import { query } from '$app/server';
import { db } from '$lib/server/db';
import { tokensTable } from '$lib/server/db/schema';
import { ilike } from 'drizzle-orm';
import z from 'zod';

export const searchTokens = query(z.string().optional(), async (term) => {
	let tokens = [];
	if (term) {
		tokens = await db
			.select()
			.from(tokensTable)
			.where(ilike(tokensTable.name, `%${term}%`));
	} else {
		tokens = await db.select().from(tokensTable);
	}
	return tokens;
});
