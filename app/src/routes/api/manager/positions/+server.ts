import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerService } from '$lib/server/manager-service';
import { MANAGER_PRIVATE_KEY } from '$env/static/private';
import { isAuthorizedManager, getDemoAddress } from '$lib/server/manager-auth';

/**
 * POST /api/manager/positions
 *
 * Get all managed positions for a user
 *
 * Request body:
 * {
 *   userAddress: string,
 *   requestingUserAddress?: string (for auth check)
 * }
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { userAddress, requestingUserAddress } = await request.json();

		if (!userAddress) {
			return json({ error: 'userAddress is required' }, { status: 400 });
		}

		// If requesting user is not authorized, use demo address
		const targetAddress = requestingUserAddress && isAuthorizedManager(requestingUserAddress)
			? userAddress
			: getDemoAddress();

		const isViewOnly = !requestingUserAddress || !isAuthorizedManager(requestingUserAddress);

		console.log(`[Positions API] Fetching positions for: ${targetAddress} (view-only: ${isViewOnly})`);

		// Initialize manager service
		const managerService = new ManagerService(MANAGER_PRIVATE_KEY);

		// Get user's managed positions
		const positions = await managerService.getUserPositions(targetAddress);

		console.log(`[Positions API] Found ${positions.length} positions`);

		return json({
			success: true,
			positions,
			isViewOnly
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
