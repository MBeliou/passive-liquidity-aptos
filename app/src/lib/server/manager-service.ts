import { Manager, type TransactionInfo } from '$lib/shared/manager';
import {
	getUserByAddress,
	createUser,
	getNextUserIndex,
	getManagedPositions,
	createManagedPosition,
	recordUserMovement,
	updateManagedPositionStatus,
	getUserBalance,
	updateUserBalance
} from './db/manager';
import { Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

/**
 * Server-side service that combines Manager and database operations
 */
export class ManagerService {
	private manager: Manager;

	constructor(privateKey: string) {
		const pk = new Ed25519PrivateKey(privateKey);
		this.manager = new Manager(pk);
	}

	/**
	 * Get or create a user by their wallet address
	 * If user doesn't exist, creates them with a new index and derived address
	 */
	async getOrCreateUser(walletAddress: string) {
		// Check if user exists
		let user = await getUserByAddress(walletAddress);

		if (!user) {
			// Create new user with next available index
			const index = await getNextUserIndex();
			user = await createUser(walletAddress, index);

			// Get derived address for this user
			const derivedAddress = this.manager.getDerivedAddress(index);
			console.log(`[ManagerService] Created user ${walletAddress} with derived address ${derivedAddress}`);
		}

		return user;
	}

	/**
	 * Handle a deposit from a user
	 * Records the deposit in the database and updates user balance
	 */
	async handleDeposit(walletAddress: string, amount: bigint, tokenId: string, txHash: string) {
		const user = await this.getOrCreateUser(walletAddress);

		// Get current balance
		const currentBalance = await getUserBalance(user.id, tokenId);
		const currentAmount = currentBalance ? BigInt(currentBalance.amount) : BigInt(0);

		// Calculate new balance
		const newAmount = currentAmount + amount;

		// Update balance in database
		const updatedBalance = await updateUserBalance(user.id, tokenId, newAmount.toString());

		// Record movement in database
		await recordUserMovement({
			userId: user.id,
			txHash,
			txInfo: JSON.stringify({
				tokenId,
				amount: amount.toString(),
				previousBalance: currentAmount.toString(),
				newBalance: newAmount.toString()
			}),
			movementType: 'deposit' as any
		});

		console.log(`[ManagerService] Deposit recorded: ${amount} of token ${tokenId} for user ${user.id}`);

		return { user, balance: updatedBalance };
	}

	/**
	 * Create a liquidity position for a user
	 */
	async createPosition(
		walletAddress: string,
		poolId: string,
		amount: bigint,
		tickLower: number,
		tickUpper: number
	) {
		const user = await this.getOrCreateUser(walletAddress);

		// Create position through manager
		const txInfo = await this.manager.createLiquidityPosition(
			user.id.toString(),
			poolId,
			amount,
			tickLower,
			tickUpper
		);

		// Parse events to get position ID
		const parsed = this.manager.parseTransactionEvents(txInfo);
		const positionId = parsed.data?.positionId;

		// Store position in database
		const position = await createManagedPosition({
			userId: user.id,
			poolId,
			positionId,
			tickLower,
			tickUpper,
			liquidity: amount.toString()
		});

		// Record movement
		await recordUserMovement({
			userId: user.id,
			txHash: txInfo.hash,
			txInfo: JSON.stringify(txInfo),
			movementType: 'rebalance' as any
		});

		return { position, txInfo };
	}

	/**
	 * Rebalance user positions based on market conditions
	 */
	async rebalancePositions(walletAddress: string, volatilityData: any) {
		const user = await this.getOrCreateUser(walletAddress);

		// Get user's active positions
		const positions = await getManagedPositions(user.id, 'active' as any);

		console.log(`[ManagerService] Rebalancing ${positions.length} positions for user ${walletAddress}`);

		const rebalanceResults: any[] = [];

		for (const position of positions) {
			// TODO: Implement rebalancing logic based on volatility
			// For now, just log what would happen
			console.log(`[ManagerService] Analyzing position ${position.positionId} in pool ${position.poolId}`);
			console.log(`[ManagerService] Current range: [${position.tickLower}, ${position.tickUpper}]`);
			console.log(`[ManagerService] Volatility data:`, volatilityData);

			// Stub: Decide whether to rebalance
			const shouldRebalance = Math.random() > 0.7; // Random decision for stub

			if (shouldRebalance) {
				console.log(`[ManagerService] Rebalancing position ${position.positionId}`);

				// TODO: Determine optimal new pool and range based on volatility
				const newTickLower = position.tickLower - 100;
				const newTickUpper = position.tickUpper + 100;

				// Move liquidity
				const txInfo = await this.manager.moveLiquidity(
					position.positionId,
					position.poolId,
					newTickLower,
					newTickUpper
				);

				// Parse events to get new position ID
				const parsed = this.manager.parseTransactionEvents(txInfo);
				const newPositionId = parsed.data?.toPositionId;

				// Close old position
				await updateManagedPositionStatus(position.positionId, 'closed' as any);

				// Create new position record
				await createManagedPosition({
					userId: user.id,
					poolId: position.poolId,
					positionId: newPositionId,
					tickLower: newTickLower,
					tickUpper: newTickUpper,
					liquidity: position.liquidity
				});

				// Record movement
				await recordUserMovement({
					userId: user.id,
					txHash: txInfo.hash,
					txInfo: JSON.stringify(txInfo),
					movementType: 'rebalance' as any
				});

				rebalanceResults.push({
					oldPositionId: position.positionId,
					newPositionId,
					txHash: txInfo.hash
				});
			}
		}

		return rebalanceResults;
	}

	/**
	 * Get all managed positions for a user by their wallet address
	 */
	async getUserPositions(walletAddress: string) {
		const user = await getUserByAddress(walletAddress);
		if (!user) return [];

		return await getManagedPositions(user.id, 'active' as any);
	}
}
