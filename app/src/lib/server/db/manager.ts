import { db } from './index';
import {
	usersTable,
	userMovementsTable,
	managedPositionsTable,
	userBalancesTable,
	type movementTypeEnum,
	type positionStatusEnum
} from './schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Get user by wallet address
 */
export async function getUserByAddress(address: string) {
	const users = await db.select().from(usersTable).where(eq(usersTable.address, address)).limit(1);
	return users[0] || null;
}

/**
 * Create a new user with the given address and index
 */
export async function createUser(address: string, index: number) {
	const [user] = await db
		.insert(usersTable)
		.values({
			address,
			index
		})
		.returning();
	return user;
}

/**
 * Get the next available user index
 */
export async function getNextUserIndex(): Promise<number> {
	const result = await db
		.select({ maxIndex: usersTable.index })
		.from(usersTable)
		.orderBy(desc(usersTable.index))
		.limit(1);

	return result[0] ? result[0].maxIndex + 1 : 0;
}

/**
 * Get all managed positions for a user
 */
export async function getManagedPositions(userId: number, status?: typeof positionStatusEnum) {
	const query = db.select().from(managedPositionsTable).where(eq(managedPositionsTable.userId, userId));

	if (status) {
		return await query.where(
			and(
				eq(managedPositionsTable.userId, userId),
				eq(managedPositionsTable.status, status as any)
			)
		);
	}

	return await query;
}

/**
 * Create a new managed position
 */
export async function createManagedPosition(data: {
	userId: number;
	poolId: string;
	positionId: string;
	tickLower: number;
	tickUpper: number;
	liquidity: string;
}) {
	const [position] = await db.insert(managedPositionsTable).values(data).returning();
	return position;
}

/**
 * Update managed position status
 */
export async function updateManagedPositionStatus(
	positionId: string,
	status: typeof positionStatusEnum
) {
	const [position] = await db
		.update(managedPositionsTable)
		.set({ status: status as any, updatedAt: new Date() })
		.where(eq(managedPositionsTable.positionId, positionId))
		.returning();
	return position;
}

/**
 * Record a user movement (deposit, withdraw, rebalance)
 */
export async function recordUserMovement(data: {
	userId: number;
	txHash: string;
	txInfo: string;
	movementType: typeof movementTypeEnum;
}) {
	const [movement] = await db.insert(userMovementsTable).values(data).returning();
	return movement;
}

/**
 * Get movement history for a user
 */
export async function getUserMovements(userId: number, limit = 50) {
	return await db
		.select()
		.from(userMovementsTable)
		.where(eq(userMovementsTable.userId, userId))
		.orderBy(desc(userMovementsTable.createdAt))
		.limit(limit);
}

/**
 * Get user balance for a specific token
 */
export async function getUserBalance(userId: number, tokenId: string) {
	const balances = await db
		.select()
		.from(userBalancesTable)
		.where(and(eq(userBalancesTable.userId, userId), eq(userBalancesTable.tokenId, tokenId)))
		.limit(1);

	return balances[0] || null;
}

/**
 * Get all balances for a user
 */
export async function getUserBalances(userId: number) {
	return await db.select().from(userBalancesTable).where(eq(userBalancesTable.userId, userId));
}

/**
 * Update user balance (insert or update)
 * @param userId - User ID
 * @param tokenId - Token ID (Tapp format)
 * @param amount - New amount as string
 */
export async function updateUserBalance(userId: number, tokenId: string, amount: string) {
	const existing = await getUserBalance(userId, tokenId);

	if (existing) {
		const [updated] = await db
			.update(userBalancesTable)
			.set({ amount, updatedAt: new Date() })
			.where(
				and(eq(userBalancesTable.userId, userId), eq(userBalancesTable.tokenId, tokenId))
			)
			.returning();
		return updated;
	} else {
		const [created] = await db
			.insert(userBalancesTable)
			.values({ userId, tokenId, amount })
			.returning();
		return created;
	}
}
