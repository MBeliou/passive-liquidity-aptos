import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { NETWORK } from "./config";

const APTOS_SDK = new Aptos(new AptosConfig({ network: NETWORK }));

export function useAptos() {
	return APTOS_SDK;
}
