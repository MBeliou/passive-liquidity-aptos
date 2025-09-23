import { initTappSDK } from '@tapp-exchange/sdk';
import { NETWORK } from '../config';
import type { Aptos } from '@aptos-labs/ts-sdk';
import type { Position } from './types';

const PROTOCOL_ADDRESSES = {
	view: '0xf5840b576a3a6a42464814bc32ae1160c50456fb885c62be389b817e75b2a385',
	router: '0x487e905f899ccb6d46fdaec56ba1e0c4cf119862a16c409904b8c78fab1f5e8a'
};

const TAPP_SDK = initTappSDK({
	network: NETWORK
});

class TappContract {
	#aptosClient: Aptos;

	constructor(aptosClient: Aptos) {
		this.#aptosClient = aptosClient;
	}

	/**
	 * Returns all open positions in a pool.
	 *
	 * Warning: Fails on some pools that have too many positions open
	 * @param poolAddress
	 */
	async getPositions(poolAddress: string) {
		const data = await this.#aptosClient.view({
			payload: {
				function: `${PROTOCOL_ADDRESSES.view}::clmm_views::get_positions`,
				typeArguments: [],
				functionArguments: [poolAddress]
			}
		});

		return data[0] as unknown as Position[];
	}

	async getPosition(poolAddress: string, positionIndex: number): Promise<Position> {
		const data = await this.#aptosClient.view({
			payload: {
				function: `${PROTOCOL_ADDRESSES.view}::clmm_views::get_position`,
				typeArguments: [],
				functionArguments: [poolAddress, positionIndex.toString()]
			}
		});

		return data[0] as unknown as Position;
	}
}


export function useTapp(aptos: Aptos) {
	return {
		sdk: TAPP_SDK,
		contract: new TappContract(aptos)
	};
}
