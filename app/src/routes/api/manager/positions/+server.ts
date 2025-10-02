import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerService } from '$lib/server/manager-service';
import { MANAGER_PRIVATE_KEY } from '$env/static/private';

/**
 * POST /api/manager/positions
 *
 * Get all managed positions for a user
 *
 * Request body:
 * {
 *   userAddress: string
 * }
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { userAddress } = await request.json();

		if (!userAddress) {
			return json({ error: 'userAddress is required' }, { status: 400 });
		}

		console.log(`[Positions API] Fetching positions for user: ${userAddress}`);

		// Initialize manager service
		const managerService = new ManagerService(MANAGER_PRIVATE_KEY);

		// Get user's managed positions
		const positions = await managerService.getUserPositions(userAddress);

		console.log(`[Positions API] Found ${positions.length} positions`);

		return json({
			success: true,
			positions
		});
	} catch (error) {
		console.error('[Positions API] Error:', error);
		return json(
			{
				error: 'Failed to fetch positions',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
