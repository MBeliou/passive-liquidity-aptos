import { db } from '$lib/server/db';
import {
	managedPositionsTable,
	userBalancesTable,
	userMovementsTable,
	usersTable
} from '$lib/server/db/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import { convertTickBitsToSigned } from '$lib/utils';

/**
 * Seed demo data for video demonstration
 * Uses real transaction data from Aptos mainnet
 */
export const POST: RequestHandler = async ({ params }) => {
	{
		console.log('🌱 Seeding demo data...');

		const demoUserAddress = '0x15b0ba37d2fc91c1ea881c58b24c45389612f4ea8495bbfda8c899de18e24fa0';
		const usdcTokenId = '0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b';
		const aptTokenId = '0x000000000000000000000000000000000000000000000000000000000000000a';
		const poolId = '0x4ed8fda291b604491ead0cc9e5232bc1edc1f31d0e0cf343be043d8c792af1a8';

		// Timestamps for realistic flow
		const now = new Date();
		const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
		const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
		const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

		try {
			// 1. Create demo user
			console.log('Creating demo user...');
			const [user] = await db
				.insert(usersTable)
				.values({
					index: 0,
					address: demoUserAddress,
					createdAt: tenMinutesAgo
				})
				.onConflictDoNothing()
				.returning();

			const userId = user?.id || 1;
			console.log(`✓ User created with ID: ${userId}`);

			// 2. First deposit: 5 USDC
			console.log('Recording USDC deposit...');
			await db
				.insert(userMovementsTable)
				.values({
					userId,
					txHash: '0x659523969e744c7242561097a232a683d908d8abc9f6df8c5b5e2dfcce38fd77',
					txInfo: JSON.stringify({
						tokenId: usdcTokenId,
						amount: '5000000',
						previousBalance: '0',
						newBalance: '5000000'
					}),
					movementType: 'deposit',
					createdAt: fiveMinutesAgo
				})
				.onConflictDoNothing();

			await db
				.insert(userBalancesTable)
				.values({
					userId,
					tokenId: usdcTokenId,
					amount: '5000000', // 5 USDC (6 decimals)
					updatedAt: fiveMinutesAgo
				})
				.onConflictDoUpdate({
					target: [userBalancesTable.userId, userBalancesTable.tokenId],
					set: { amount: '5000000', updatedAt: fiveMinutesAgo }
				});

			console.log('✓ USDC deposit recorded: 5 USDC');

			// 3. Second deposit: 0.2 APT
			console.log('Recording APT deposit...');
			await db
				.insert(userMovementsTable)
				.values({
					userId,
					txHash: '0xe05633d8c67dc50d5f4e0cba949a97bed4f7d8c0567483d30e0073c4fd2fda71',
					txInfo: JSON.stringify({
						tokenId: aptTokenId,
						amount: '20000000',
						previousBalance: '0',
						newBalance: '20000000'
					}),
					movementType: 'deposit',
					createdAt: twoMinutesAgo
				})
				.onConflictDoNothing();

			await db
				.insert(userBalancesTable)
				.values({
					userId,
					tokenId: aptTokenId,
					amount: '20000000', // 0.2 APT (8 decimals)
					updatedAt: twoMinutesAgo
				})
				.onConflictDoUpdate({
					target: [userBalancesTable.userId, userBalancesTable.tokenId],
					set: { amount: '20000000', updatedAt: twoMinutesAgo }
				});

			console.log('✓ APT deposit recorded: 0.2 APT');

			// 4. Create liquidity position (all funds deployed)
			console.log('Creating liquidity position...');

			// Convert unsigned tick values to signed using existing utility
			const tickLower = convertTickBitsToSigned(BigInt('18446744073709522046'));
			const tickUpper = convertTickBitsToSigned(BigInt('18446744073709523136'));

			await db
				.insert(managedPositionsTable)
				.values({
					userId: userId,
					poolId,
					positionId: '3677',
					tickLower,
					tickUpper,
					liquidity: '0', // Placeholder - would be calculated from amounts
					status: 'active',
					createdAt: now,
					updatedAt: now
				})
				.onConflictDoNothing();

			// Record position creation as rebalance movement
			await db
				.insert(userMovementsTable)
				.values({
					userId,
					txHash: '0x283024859c0e8085abf478d401533d72a9e5b56af7882f81065bacabce94b9be',
					txInfo: JSON.stringify({
						positionId: '3677',
						poolId,
						tickLower,
						tickUpper,
						liquidity: '0'
					}),
					movementType: 'rebalance',
					createdAt: now
				})
				.onConflictDoNothing();

			console.log('✓ Position created: ID 3677');

			// 5. Update balances to 0 (all funds deployed to position)
			console.log('Deploying all funds to position...');
			await db
				.insert(userBalancesTable)
				.values([
					{
						userId,
						tokenId: usdcTokenId,
						amount: '0',
						updatedAt: now
					},
					{
						userId,
						tokenId: aptTokenId,
						amount: '0',
						updatedAt: now
					}
				])
				.onConflictDoUpdate({
					target: [userBalancesTable.userId, userBalancesTable.tokenId],
					set: { amount: '0', updatedAt: now }
				});

			console.log('✓ All funds deployed to position');

			console.log('\n✅ Demo data seeded successfully!');
			console.log('\nSummary:');
			console.log('- User:', demoUserAddress);
			console.log('- Deposits: 5 USDC + 0.2 APT');
			console.log('- Position ID: 3677');
			console.log('- All funds deployed to liquidity position');

			return json({
				status: 'success'
			});
		} catch (seedError) {
			console.error('❌ Error seeding demo data:', seedError);
			return json({
				status: 'error',
				message: seedError
			});
		}
	}
};
