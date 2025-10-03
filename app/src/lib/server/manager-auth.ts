import { ALLOWED_MANAGER_ADDRESS, PUBLIC_DEMO_ADDRESS } from '$env/static/private';

/**
 * Check if an address is authorized to use manager features
 */
export function isAuthorizedManager(address: string): boolean {
	return address.toLowerCase() === ALLOWED_MANAGER_ADDRESS.toLowerCase();
}

/**
 * Get the demo address to display for non-authorized users
 */
export function getDemoAddress(): string {
	return PUBLIC_DEMO_ADDRESS;
}
