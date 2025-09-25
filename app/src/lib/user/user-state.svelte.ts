import { searchTokens } from '$lib/components/app/search-panel/data.remote';
import { useTapp } from '$lib/shared';
import type { WalletState } from '$lib/wallet/wallet.svelte';
import type { Aptos } from '@aptos-labs/ts-sdk';
import { type AccountInfo } from '@aptos-labs/wallet-adapter-core';
import { getContext, setContext } from 'svelte';

export class UserState {
	account = $state<AccountInfo | null>(null);

	balances = $state<Awaited<ReturnType<InstanceType<typeof UserState>['getBalances']>>>([]);

	aptosClient: Aptos;
	tappClient: ReturnType<typeof useTapp>;

	constructor(walletState: WalletState, aptosClient: Aptos) {
		this.aptosClient = aptosClient;
		this.tappClient = useTapp(aptosClient);

		$effect(() => {
			if (this.account) {
				console.log('found account');
				this.refreshBalances();
				this.getPositions();
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

	// Utils

	async refreshBalances() {
		this.balances = await this.getBalances();
	}
}

const USER_KEY = Symbol('USER_STATE');

export function setUser(user: UserState) {
	return setContext(USER_KEY, user);
}

export function getUser() {
	return getContext<ReturnType<typeof setUser>>(USER_KEY);
}
