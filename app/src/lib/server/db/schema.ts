import { decimal, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const tokensTable = pgTable('tokens', {
	id: varchar({ length: 66 }).primaryKey(),
	symbol: text().notNull(),
	name: text(),
	about: text(),
	logo: text(),
	decimals: integer().notNull(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const poolsTable = pgTable('pools', {
	id: varchar().primaryKey(),

	tokenA: varchar('token_a').references(() => tokensTable.id),
	tokenB: varchar('token_b').references(() => tokensTable.id),
	fee: decimal().notNull(),
	dex: varchar().notNull(), // Only dealing with tapp for now but we might have time to expand
	positionIndex: integer('position_index').default(0), // highest position found
	updatedAt: timestamp('updated_at').defaultNow()
});

export const positionsTable = pgTable('positions', {
	index: integer(),
	pool: varchar().references(() => poolsTable.id),
	updatedAt: timestamp('updated_at').defaultNow()
});

/*
 NOTE: Not quite doing the vaults for now, we'll see if we get the opportunity.
export const vault = pgTable('vaults', {});
*/
