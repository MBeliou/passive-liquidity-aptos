import { useTapp } from '$lib/shared';
import type { WalletState } from '$lib/wallet/wallet.svelte';
import type { Aptos } from '@aptos-labs/ts-sdk';
import { type AccountInfo } from '@aptos-labs/wallet-adapter-core';
import { getContext, setContext } from 'svelte';

export class UserState {
	account = $state<AccountInfo | null>(null);

	balances = $state<Awaited<ReturnType<InstanceType<typeof UserState>['getBalances']>>>([]);
	managedPositions = $state<any[]>([]);
	loadingManagedPositions = $state(false);

	aptosClient: Aptos;
	tappClient: ReturnType<typeof useTapp>;

	// Authorization state
	isAuthorized = $derived(
		this.account ? this.checkAuthorization(this.account.address.toString()) : false
	);

	// Address to use for API calls (user's if authorized, demo address if not)
	displayAddress = $derived.by(() => {
		if (!this.account) return null;
		return this.isAuthorized ? this.account.address.toString() : this.getDemoAddress();
	});

	private checkAuthorization(address: string): boolean {
		// This will be checked server-side, but we expose it client-side for UI
		return false; // Client-side always returns false for security
	}

	private getDemoAddress(): string {
		// This is fetched from server on first load
		return '';
	}

	constructor(walletState: WalletState, aptosClient: Aptos) {
		this.aptosClient = aptosClient;
		this.tappClient = useTapp(aptosClient);

		$effect(() => {
			if (this.account) {
				console.log('found account');
				this.refreshBalances();
				this.getPositions();
				this.refreshManagedPositions();
			} else {
				// Clear managed positions when account disconnects
				this.managedPositions = [];
			}
		});

		$effect(() => {
			this.account = walletState.account;
		});
	}

	async getBalances() {
		if (!this.account) {
			return [];
		}

		const balances = await this.aptosClient.getCurrentFungibleAssetBalances({
			options: {
				limit: 100,
				where: {
					owner_address: {
						_eq: this.account.address.toString()
					}
				}
			}
		});

		const metadatas = await this.aptosClient.getFungibleAssetMetadata({
			options: {
				where: {
					asset_type: {
						_in: balances.map((b) => b.asset_type)
					}
				}
			}
		});
		return balances.map((b) => {
			const metadata = metadatas.find((m) => m.asset_type === b.asset_type);
			return {
				...b,
				metadata: metadata!
			};
		});
	}

	async getPositions() {
		const positions = await this.tappClient.sdk.Position.getPositions({
			userAddr: '',
			size: 30
		});

		return positions.data;
	}

	async getManagedPositions() {
		if (!this.account || !this.displayAddress) {
			return [];
		}

		try {
			const response = await fetch('/api/manager/positions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userAddress: this.displayAddress, // Use displayAddress (demo if not authorized)
					requestingUserAddress: this.account.address.toString() // Send actual user for auth check
				})
			});

			const result = await response.json();
			return result.positions || [];
		} catch (error) {
			console.error('Failed to fetch managed positions:', error);
			return [];
		}
	}

	async triggerRebalance() {
		if (!this.account || !this.isAuthorized) {
			console.warn('Rebalance action not authorized');
			return null;
		}

		this.loadingManagedPositions = true;
		try {
			const response = await fetch('/api/manager/rebalance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userAddress: this.account.address.toString()
				})
			});

			const result = await response.json();
			console.log('Rebalance result:', result);

			// Refresh positions after rebalancing
			await this.refreshManagedPositions();

			return result;
		} catch (error) {
			console.error('Failed to trigger rebalance:', error);
			return null;
		} finally {
			this.loadingManagedPositions = false;
		}
	}

	// Utils
	async refreshBalances() {
		this.balances = await this.getBalances();
	}

	async refreshManagedPositions() {
		this.loadingManagedPositions = true;
		this.managedPositions = await this.getManagedPositions();
		this.loadingManagedPositions = false;
	}
}

const USER_KEY = Symbol('USER_STATE');

export function setUser(user: UserState) {
	return setContext(USER_KEY, user);
}

export function getUser() {
	return getContext<ReturnType<typeof setUser>>(USER_KEY);
}
