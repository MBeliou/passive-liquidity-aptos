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
	async iterGetPositions(
		poolAddress: string,
		options: { indexes?: number[]; maximumIndex: number; batchSize?: number }
	) {
		const { indexes, maximumIndex, batchSize = 50 } = options;
		const positions: Position[] = [];
		const successfulIndexes: number[] = [];
		const failedIndexes: number[] = [];

		// Determine which positions to fetch
		const positionIndexes = indexes || Array.from({ length: maximumIndex }, (_, i) => i);

		// Process in batches
		for (let i = 0; i < positionIndexes.length; i += batchSize) {
			const batchEnd = Math.min(i + batchSize, positionIndexes.length);
			const batch = positionIndexes.slice(i, batchEnd);

			console.log(
				`Fetching positions batch ${Math.floor(i / batchSize) + 1}: indexes ${batch[0]}-${batch[batch.length - 1]}`
			);

			// Create promises for this batch
			const batchPromises = batch.map(async (positionIndex) => {
				try {
					const position = await this.getPosition(poolAddress, positionIndex);
					return { success: true, index: positionIndex, position };
				} catch (error) {
					// Position doesn't exist or other error
					return { success: false, index: positionIndex, error: error.message };
				}
			});

			// Execute batch with Promise.allSettled to handle individual failures
			const batchResults = await Promise.allSettled(batchPromises);

			// Process results
			let batchSuccessCount = 0;
			let batchFailureCount = 0;

			batchResults.forEach((result, idx) => {
				const positionIndex = batch[idx];

				if (result.status === 'fulfilled') {
					if (result.value.success) {
						positions.push(result.value.position);
						successfulIndexes.push(positionIndex);
						batchSuccessCount++;
					} else {
						failedIndexes.push(positionIndex);
						batchFailureCount++;
						// Optionally log specific failures
						// console.warn(`Position ${positionIndex} failed: ${result.value.error}`);
					}
				} else {
					failedIndexes.push(positionIndex);
					batchFailureCount++;
					console.warn(`Batch promise rejected for index ${positionIndex}:`, result.reason);
				}
			});

			console.log(`Batch complete: ${batchSuccessCount} success, ${batchFailureCount} failed`);

			// Optional: Add delay between batches to avoid rate limiting
			if (i + batchSize < positionIndexes.length) {
				await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
			}
		}

		console.log(
			`✅ Fetching complete: ${positions.length} positions retrieved out of ${positionIndexes.length} attempted`
		);

		return {
			positions,
			successfulIndexes,
			failedIndexes
		};
	}

	async getCurrentIndex(poolAddress: string): Promise<number> {
		const data = await this.#aptosClient.view({
			payload: {
				function: `${PROTOCOL_ADDRESSES.view}::clmm_views::current_tick_idx`,
				typeArguments: [],
				functionArguments: [poolAddress]
			}
		});

		return parseInt(data[0] as unknown as string, 10);
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

	async getPositionCountFromPool(poolAddress: string) {
		const poolResource: { position_index: string } = await this.#aptosClient.getAccountResource({
			accountAddress: poolAddress,
			resourceType: '0x5c2e5a4d1b355b939ab160c618ed5504a6e1addf109388aa3b83b73b207ab6c7::clmm::Pool'
		});

		const positionCount = parseInt(poolResource.position_index);

		return positionCount;
	}
}

export function useTapp(aptos: Aptos) {
	return {
		sdk: TAPP_SDK,
		contract: new TappContract(aptos)
	};
}
