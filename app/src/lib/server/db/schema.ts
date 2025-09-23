import { pgTable, serial, integer, varchar, text, decimal, timestamp } from 'drizzle-orm/pg-core';

export const token = pgTable('tokens', {
	id: varchar({ length: 66 }).primaryKey(),
	symbol: text().notNull(),
	name: text(),
	about: text(),
	logo: text(),
	decimals: integer().notNull(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const pools = pgTable('pools', {
	id: varchar().primaryKey(),

	tokenA: varchar('token_a').references(() => token.id),
	tokenB: varchar('token_b').references(() => token.id),
	fee: decimal().notNull(),
	dex: varchar().notNull(), // Only dealing with tapp for now but we might have time to expand
	positionIndex: integer('position_index').default(0), // highest position found
	updatedAt: timestamp('updated_at').defaultNow()
});

export const positions = pgTable('positions', {
	index: integer(),
	pool: varchar().references(() => pools.id),
	updatedAt: timestamp('updated_at').defaultNow()
});

/*
 NOTE: Not quite doing the vaults for now, we'll see if we get the opportunity.
export const vault = pgTable('vaults', {});
*/
