import type { PageServerLoad } from './$types';
import { ManagerService } from '$lib/server/manager-service';
import { MANAGER_PRIVATE_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	// TODO: Get user address from session/auth
	// For now, we'll return empty positions
	// The client will need to pass the wallet address once connected

	return {
		managedPositions: []
	};
};
