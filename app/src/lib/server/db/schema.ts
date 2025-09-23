import { pgTable, serial, integer, varchar, text, decimal } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	age: integer('age')
});

export const token = pgTable('tokens', {
	id: varchar({ length: 66 }).primaryKey(),
	symbol: text(),
	name: text(),
	logo: text(),
	decimals: integer().notNull()
});

export const vault = pgTable('vaults', {});




export const pools = pgTable("pools", {
	id: varchar().primaryKey(),

	token1: varchar().references(() => token.id),
	token2: varchar().references(() => token.id),
	fee: decimal().notNull()
});