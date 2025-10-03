import { MANAGER_PRIVATE_KEY, PUBLIC_DEMO_ADDRESS } from '$env/static/private';
import { Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { Manager } from '$lib/shared/manager';

/**
 * Get the manager's address from the private key
 * No caching - creates fresh instance each time for security
 */
function getManagerAddress(): string {
	const privateKey = new Ed25519PrivateKey(MANAGER_PRIVATE_KEY);
	const manager = new Manager(privateKey);
	return manager.getManagerAddress();
}

/**
 * Check if an address is authorized to use manager features
 */
export function isAuthorizedManager(address: string): boolean {
	const managerAddress = getManagerAddress();
	return address.toLowerCase() === managerAddress.toLowerCase();
}

/**
 * Get the demo address to display for non-authorized users
 */
export function getDemoAddress(): string {
	return PUBLIC_DEMO_ADDRESS;
}
