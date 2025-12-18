import {
	bigint,
	decimal,
	doublePrecision,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

// TODO: use singular name for tables, it's cleaner really.

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
	positionIndex: integer('position_index').default(0), // highest position found, unused for now as we're using the positions themselves and we can deal with the added API queries

	tradingAPR: doublePrecision('trading_apr').notNull().default(0.0),
	bonusAPR: doublePrecision('bonus_apr').notNull().default(0.0),

	tvl: doublePrecision('tvl').notNull().default(0.0),

	volumeDay: doublePrecision('volume_day').notNull().default(0.0),
	volumeWeek: doublePrecision('volume_week').notNull().default(0.0),
	volumeMonth: doublePrecision('volume_month').notNull().default(0.0),
	volumePrevDay: doublePrecision('volume_prev_day').notNull().default(0.0),

	updatedAt: timestamp('updated_at').defaultNow()
});

export const positionsTable = pgTable(
	'positions',
	{
		index: integer().notNull(),
		pool: varchar()
			.references(() => poolsTable.id)
			.notNull(),
		updatedAt: timestamp('updated_at').defaultNow(),
		tickLower: bigint('tick_lower', { mode: 'number' }).notNull(),
		tickUpper: bigint('tick_upper', { mode: 'number' }).notNull(),
		liquidity: varchar().notNull()
	},
	(table) => [primaryKey({ columns: [table.index, table.pool] })]
);

// chain IDs can be found at https://chainlist.org/
// I don't think we want rpcs here.
export const chainsTable = pgTable('chains', {
	id: varchar().primaryKey(),
	name: varchar().notNull()
});

export const protocolsTable = pgTable('protocols', {
	id: serial().primaryKey(),
	name: varchar().notNull(),
	url: varchar()
});
