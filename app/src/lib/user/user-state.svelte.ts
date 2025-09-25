import { useTapp } from '$lib/shared';
import type { WalletState } from '$lib/wallet/wallet.svelte';
import type { Aptos } from '@aptos-labs/ts-sdk';
import { type AccountInfo } from '@aptos-labs/wallet-adapter-core';
import { getContext, setContext } from 'svelte';

export class UserState {
	account = $state<AccountInfo | null>(null);

	balances = $state<ReturnType<InstanceType<typeof UserState>['getBalances']>>(Promise.resolve([]));

	aptosClient: Aptos;
	tappClient: ReturnType<typeof useTapp>;

	constructor(walletState: WalletState, aptosClient: Aptos) {
		this.aptosClient = aptosClient;
		this.tappClient = useTapp(aptosClient);

		$effect(() => {
			if (this.account) {
				console.log('found account');
				this.balances = this.getBalances();
				this.getPositions();
			}
		});

		$effect(() => {
			this.account = walletState.account;
		});
	}

	async getBalances() {
		console.log('getting balances');
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
		console.log(balances);
		return balances;
	}

	async getPositions() {
		const positions = await this.tappClient.sdk.Position.getPositions({
			userAddr: '',
			size: 30
		});

		return positions.data;
	}
}

const USER_KEY = Symbol('USER_STATE');

export function setUser(user: UserState) {
	return setContext(USER_KEY, user);
}

export function getUser() {
	return getContext<ReturnType<typeof setUser>>(USER_KEY);
}
