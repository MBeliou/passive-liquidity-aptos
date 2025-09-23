import { Network } from '@aptos-labs/ts-sdk';
import { initTappSDK } from '@tapp-exchange/sdk';

const TAPP_SDK = initTappSDK({
	network: Network.MAINNET
});

export function useTapp() {
	return TAPP_SDK;
}
