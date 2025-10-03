import z from 'zod';
import { error } from '@sveltejs/kit';
import { query, form } from '$app/server';
import { ManagerService } from '$lib/server/manager-service';
import { MANAGER_PRIVATE_KEY } from '$env/static/private';
import { isAuthorizedManager, getDemoAddress } from '$lib/server/manager-auth';
import { getUserByAddress, getUserBalances } from '$lib/server/db/manager';
import { db } from '$lib/server/db';
import { tokensTable, positionsTable } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get managed positions for a user
 * If user is not authorized, returns demo positions
 */
export const getManagedPositions = query(
	z.object({
		userAddress: z.string(),
		requestingUserAddress: z.string()
	}),
	async ({ userAddress, requestingUserAddress }) => {
		// If requesting user is not authorized, use demo address
		const targetAddress =
			requestingUserAddress && isAuthorizedManager(requestingUserAddress)
				? userAddress
				: getDemoAddress();

		const isViewOnly = !requestingUserAddress || !isAuthorizedManager(requestingUserAddress);

		console.log(
			`[getManagedPositions] Fetching positions for: ${targetAddress} (view-only: ${isViewOnly})`
		);

		const managerService = new ManagerService(MANAGER_PRIVATE_KEY);

		const positions = await managerService.getUserPositions(targetAddress);

		// Fetch actual liquidity from positionsTable for each position
		const positionsWithLiquidity = await Promise.all(
			positions.map(async (position) => {
				// Query positionsTable using composite key (index, pool)
				const [positionData] = await db
					.select()
					.from(positionsTable)
					.where(
						and(
							eq(positionsTable.index, parseInt(position.positionId)),
							eq(positionsTable.pool, position.poolId)
						)
					)
					.limit(1);

				// Use actual liquidity from positionsTable if found
				const actualLiquidity = positionData?.liquidity || position.liquidity;

				return {
					...position,
					liquidity: actualLiquidity,
					liquidityValue: actualLiquidity
				};
			})
		);

		console.log(`[getManagedPositions] Found ${positionsWithLiquidity.length} positions with liquidity data`);

		return {
			positions: positionsWithLiquidity,
			isViewOnly
		};
	}
);

/**
 * Handle user deposit
 */
export const deposit = form(
	z.object({
		userAddress: z.string().min(1),
		txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
		tokenId: z.string().min(1),
		amount: z.string().min(1).regex(/^\d+$/)
	}),
	async ({ userAddress, txHash, tokenId, amount }) => {
		// Check authorization
		if (!isAuthorizedManager(userAddress)) {
			error(403, 'Unauthorized');
		}

		console.log(`[Deposit] Processing deposit for user: ${userAddress}`);

		const managerService = new ManagerService(MANAGER_PRIVATE_KEY);

		// Get or create user
		const user = await managerService.getOrCreateUser(userAddress);

		// Handle deposit (records movement and updates balance)
		const result = await managerService.handleDeposit(userAddress, BigInt(amount), tokenId, txHash);

		console.log(`[Deposit] Deposit successful for user ${userAddress}`);

		return {
			success: true,
			balance: result.balance,
			txHash
		};
	}
);

/**
 * Handle user withdrawal
 */
export const withdraw = form(
	z.object({
		amount: z.string().min(1).regex(/^\d+$/)
	}),
	async ({ amount }) => {
		// TODO: Get user from session/auth
		// For now, this is a placeholder
		error(501, 'Withdrawal functionality not yet implemented');
	}
);

/**
 * Get managed balances (undeployed funds) for a user
 * If user is not authorized, returns demo balances
 */
export const getManagedBalances = query(
	z.object({
		userAddress: z.string(),
		requestingUserAddress: z.string()
	}),
	async ({ userAddress, requestingUserAddress }) => {
		// If requesting user is not authorized, use demo address
		const targetAddress =
			requestingUserAddress && isAuthorizedManager(requestingUserAddress)
				? userAddress
				: getDemoAddress();

		const isViewOnly = !requestingUserAddress || !isAuthorizedManager(requestingUserAddress);

		console.log(
			`[getManagedBalances] Fetching balances for: ${targetAddress} (view-only: ${isViewOnly})`
		);

		// Get user from database
		const user = await getUserByAddress(targetAddress);
		if (!user) {
			console.log(`[getManagedBalances] No user found for address: ${targetAddress}`);
			return { balances: [], isViewOnly };
		}

		// Get user's balances
		const userBalances = await getUserBalances(user.id);

		// Fetch token metadata for each balance
		const balancesWithMetadata = await Promise.all(
			userBalances.map(async (balance) => {
				const [token] = await db
					.select()
					.from(tokensTable)
					.where(eq(tokensTable.id, balance.tokenId))
					.limit(1);

				return {
					tokenId: balance.tokenId,
					amount: balance.amount,
					token: token || null
				};
			})
		);

		console.log(`[getManagedBalances] Found ${balancesWithMetadata.length} balances`);

		return {
			balances: balancesWithMetadata,
			isViewOnly
		};
	}
);

/**
 * Format token amount using decimals
 */
function formatTokenAmount(amount: string, decimals: number): string {
	const value = BigInt(amount);
	const divisor = BigInt(10 ** decimals);
	const whole = value / divisor;
	const remainder = value % divisor;

	if (remainder === BigInt(0)) {
		return whole.toString();
	}

	const decimalStr = remainder.toString().padStart(decimals, '0');
	const trimmed = decimalStr.replace(/0+$/, '');
	return `${whole}.${trimmed}`;
}

/**
 * Get managed movements (transaction history) for a user
 * If user is not authorized, returns demo movements
 */
export const getManagedMovements = query(
	z.object({
		userAddress: z.string(),
		requestingUserAddress: z.string()
	}),
	async ({ userAddress, requestingUserAddress }) => {
		// If requesting user is not authorized, use demo address
		const targetAddress =
			requestingUserAddress && isAuthorizedManager(requestingUserAddress)
				? userAddress
				: getDemoAddress();

		const isViewOnly = !requestingUserAddress || !isAuthorizedManager(requestingUserAddress);

		console.log(
			`[getManagedMovements] Fetching movements for: ${targetAddress} (view-only: ${isViewOnly})`
		);

		// Get user from database
		const user = await getUserByAddress(targetAddress);
		if (!user) {
			console.log(`[getManagedMovements] No user found for address: ${targetAddress}`);
			return { movements: [], isViewOnly };
		}

		// Import getUserMovements
		const { getUserMovements } = await import('$lib/server/db/manager');
		const userMovements = await getUserMovements(user.id);

		// Transform movements to component format
		const formattedMovements = await Promise.all(
			userMovements.map(async (movement) => {
				const txInfo = movement.txInfo ? JSON.parse(movement.txInfo) : {};

				// Base movement data
				const baseMovement = {
					id: movement.id.toString(),
					type: movement.movementType,
					timestamp: movement.createdAt,
					txHash: movement.txHash
				};

				// Handle deposit/withdraw
				if (movement.movementType === 'deposit' || movement.movementType === 'withdraw') {
					const tokenId = txInfo.tokenId;
					const [token] = await db
						.select()
						.from(tokensTable)
						.where(eq(tokensTable.id, tokenId))
						.limit(1);

					// Format amount using token decimals
					const formattedAmount = token
						? formatTokenAmount(txInfo.amount, token.decimals)
						: txInfo.amount;

					return {
						...baseMovement,
						amount: formattedAmount,
						tokenSymbol: token?.symbol || 'Unknown'
					};
				}

				// Handle rebalance - just return basic info for now
				return {
					...baseMovement,
					fromPool: undefined,
					toPool: undefined,
					amountMoved: txInfo.liquidity
				};
			})
		);

		console.log(`[getManagedMovements] Found ${formattedMovements.length} movements`);

		return {
			movements: formattedMovements,
			isViewOnly
		};
	}
);
