import { Account, Aptos, AptosConfig, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk';

/**
 * Operation Context
 */
type Context = {
	userAddress: string;
	pool: string;
};

/**
 * Manager is responsible for handling positions, moving them between pools and fee rates.
 */
export class Manager {
	#aptosClient: Aptos;
	#account: Account;

	constructor(pk: Ed25519PrivateKey) {
		const aptosConfig = new AptosConfig({
			network: Network.MAINNET
		});
		this.#account = Account.fromPrivateKey({ privateKey: pk });
		this.#aptosClient = new Aptos(aptosConfig);
	}

	async moveLiquidity(from: string, to: string) {
		throw 'Unimplemented';
	}

	async createLiquidityPosition() {
		throw 'Unimplemented';
	}

	async removeLiquidity() {
		throw 'Unimplemented';
	}
}
