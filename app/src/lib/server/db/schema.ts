import {
	bigint,
	decimal,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

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

export const positionsTable = pgTable(
	'positions',
	{
		index: integer().notNull(),
		pool: varchar().references(() => poolsTable.id).notNull(),
		updatedAt: timestamp('updated_at').defaultNow(),
		tickLower: bigint('tick_lower', {mode: "number"}).notNull(),
		tickUpper: bigint('tick_upper', {mode: "number"}).notNull(),
		liquidity: varchar().notNull()
	},
	(table) => [primaryKey({ columns: [table.index, table.pool] })]
);

/*
 NOTE: Not quite doing the vaults for now, we'll see if we get the opportunity.
export const vault = pgTable('vaults', {});
*/

// Manager-related tables

export const usersTable = pgTable('users', {
	id: serial().primaryKey(),
	index: integer().notNull().unique(),
	address: varchar({ length: 66 }).notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const movementTypeEnum = pgEnum('movement_type', ['deposit', 'withdraw', 'rebalance']);

export const userMovementsTable = pgTable('user_movements', {
	id: serial().primaryKey(),
	userId: integer('user_id')
		.references(() => usersTable.id)
		.notNull(),
	txHash: varchar('tx_hash', { length: 66 }).notNull(),
	txInfo: text('tx_info'), // JSON string with transaction details
	movementType: movementTypeEnum('movement_type').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const positionStatusEnum = pgEnum('position_status', ['active', 'closed']);

export const managedPositionsTable = pgTable('managed_positions', {
	id: serial().primaryKey(),
	userId: integer('user_id')
		.references(() => usersTable.id)
		.notNull(),
	poolId: varchar('pool_id').references(() => poolsTable.id).notNull(),
	positionId: varchar('position_id').notNull(), // On-chain position ID
	tickLower: bigint('tick_lower', { mode: 'number' }).notNull(),
	tickUpper: bigint('tick_upper', { mode: 'number' }).notNull(),
	liquidity: varchar().notNull(),
	status: positionStatusEnum().notNull().default('active'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});
