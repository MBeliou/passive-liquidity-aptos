import z from 'zod';
import { error } from '@sveltejs/kit';
import { query, form } from '$app/server';
import { ManagerService } from '$lib/server/manager-service';
import { MANAGER_PRIVATE_KEY } from '$env/static/private';
import { isAuthorizedManager, getDemoAddress } from '$lib/server/manager-auth';
import { getUserByAddress, getUserBalances } from '$lib/server/db/manager';
import { db } from '$lib/server/db';
import { tokensTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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

		console.log(`[getManagedPositions] Found ${positions.length} positions`);

		return {
			positions,
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
