import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerService } from '$lib/server/manager-service';
import { MANAGER_PRIVATE_KEY } from '$env/static/private';

/**
 * POST /api/manager/rebalance
 *
 * Analyzes user positions and rebalances based on market conditions
 *
 * Request body:
 * {
 *   userAddress: string,
 *   poolIds?: string[] // Optional: specific pools to analyze
 * }
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { userAddress, poolIds } = await request.json();

		if (!userAddress) {
			return json({ error: 'userAddress is required' }, { status: 400 });
		}

		console.log(`[Rebalance API] Processing rebalance request for user: ${userAddress}`);

		// Initialize manager service
		const managerService = new ManagerService(MANAGER_PRIVATE_KEY);

		// Get user positions
		const positions = await managerService.getUserPositions(userAddress);

		if (positions.length === 0) {
			return json({
				success: true,
				message: 'No positions to rebalance',
				rebalanced: []
			});
		}

		console.log(`[Rebalance API] Found ${positions.length} positions for user`);

		// TODO: Fetch current volatility data for pools
		// For now, using stub volatility data
		const volatilityData = {
			week: 45.2,
			day: 52.1,
			hour: 48.3,
			trend: 'increasing' as const,
			level: 'moderate' as const
		};

		console.log(`[Rebalance API] Analyzing positions with volatility:`, volatilityData);

		// Execute rebalancing
		const rebalanceResults = await managerService.rebalancePositions(userAddress, volatilityData);

		console.log(`[Rebalance API] Rebalanced ${rebalanceResults.length} positions`);

		return json({
			success: true,
			message: `Analyzed ${positions.length} positions, rebalanced ${rebalanceResults.length}`,
			analyzed: positions.length,
			rebalanced: rebalanceResults,
			volatility: volatilityData
		});
	} catch (error) {
		console.error('[Rebalance API] Error:', error);
		return json(
			{
				error: 'Failed to process rebalance request',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
