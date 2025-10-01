import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { NETWORK } from './config';


export function useAptos(apiKey?: string) {
	return new Aptos(
		new AptosConfig({
			network: NETWORK,
			clientConfig: {
				API_KEY: apiKey
			}
		})
	);
}
