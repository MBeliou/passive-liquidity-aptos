import {
	type AccountInfo,
	type NetworkInfo,
	WalletCore,
	type AdapterWallet,
	type AptosSignInInput,
	type AptosSignInOutput,
	type InputTransactionData,
	type Network,
	type AdapterNotDetectedWallet,
	type AvailableWallets,
	type DappConfig
} from '@aptos-labs/wallet-adapter-core';
import { getContext, setContext } from 'svelte';

export class WalletState {
	connected = $state(false);
	account = $state<AccountInfo | null>(null);
	network = $state<NetworkInfo | null>(null);
	wallet = $state<AdapterWallet | null>(null);

	walletCore = $state<WalletCore | null>(null);
	wallets = $derived.by(() => this.walletCore?.wallets || []);
	notDetectedWallets = $derived.by(() => this.walletCore?.notDetectedWallets || []);

	isLoading = $state(false);

	onError: (error: unknown) => void;

	constructor(
		optInWallets: AvailableWallets[],
		dappConfig: DappConfig,
		onError: (error: unknown) => void = (error) => console.error(error),
		disableTelemetry = false
	) {
		this.onError = onError;

		const walletCore = new WalletCore(optInWallets, dappConfig, disableTelemetry);
		this.walletCore = walletCore;

		$effect(() => {
			if (this.connected) {
				this.walletCore?.onAccountChange();
				this.walletCore?.onNetworkChange();
				this.wallet = this.walletCore?.wallet || null;
			}
		});

		$effect(() => {
			if (this.walletCore) {
				this.eventsSetUp(this.walletCore);
			}
		});
	}

	async connect(walletName: string) {
		try {
			this.isLoading = true;
			if (this.walletCore) {
				await this.walletCore.connect(walletName);

				this.account = this.walletCore.account;
			}
		} catch (error) {
			if (this.onError) {
				this.onError(error);
			}
			return Promise.reject(error);
		} finally {
			this.isLoading = false;
		}
	}

	async signIn(args: { walletName: string; input: AptosSignInInput }): Promise<AptosSignInOutput> {
		if (!this.walletCore) {
			throw new Error('WalletCore is not initialized');
		}

		try {
			this.isLoading = true;
			return await this.walletCore?.signIn(args);
		} catch (error) {
			if (this.onError) this.onError(error);
			return Promise.reject(error);
		} finally {
			this.isLoading = false;
		}
	}

	async disconnect() {
		try {
			await this.walletCore?.disconnect();
			this.account = null;
		} catch (error) {
			if (this.onError) this.onError(error);
			return Promise.reject(error);
		}
	}

	async signAndSubmitTransaction(transaction: InputTransactionData) {
		this.expectsWalletCore();
		try {
			return await this.walletCore?.signAndSubmitTransaction(transaction);
		} catch (error) {
			if (this.onError) this.onError(error);
			return Promise.reject(error);
		}
	}

	async changeNetwork(network: Network) {
		this.expectsWalletCore();
		await this.errorGuard(this.walletCore?.changeNetwork(network));
	}

	async handleConnect() {
		this.connected = true;
	}

	async handleDisconnect() {
		this.connected = false;
	}

	async handleAccountChange() {
		this.account = this.walletCore?.account || null;
	}
	async handleNetworkChange() {
		this.network = this.walletCore?.network || null;
	}

	handleStandardWalletsAdded(wallet: AdapterWallet) {
		// Manage current wallet state by removing optional duplications
		// as new wallets are coming
		const existingWalletIndex = this.wallets.findIndex((w) => w.name === wallet.name);

		if (existingWalletIndex !== -1) {
			this.wallets = [
				...this.wallets.slice(0, existingWalletIndex),
				wallet,
				...this.wallets.slice(existingWalletIndex + 1)
			];
		} else {
			this.wallets = [...this.wallets, wallet];
		}
	}

	handleStandardNotDetectedWalletsAdded(wallet: AdapterNotDetectedWallet) {
		// Manage current wallet state by removing optional duplications
		// as new wallets are coming
		const existingWalletIndex = this.notDetectedWallets.findIndex((w) => w.name === wallet.name);

		if (existingWalletIndex !== -1) {
			this.notDetectedWallets = [
				...this.notDetectedWallets.slice(0, existingWalletIndex),
				wallet,
				...this.notDetectedWallets.slice(existingWalletIndex + 1)
			];
		} else {
			this.notDetectedWallets = [...this.notDetectedWallets, wallet];
		}
	}

	// Utils
	private expectsWalletCore() {
		if (!this.walletCore) {
			throw new Error('WalletCore is not initialized');
		}
	}

	private async errorGuard<T>(promise?: Promise<T>) {
		try {
			return await promise;
			//fn?.();
		} catch (error) {
			if (this.onError) {
				this.onError(error);
			}
			return Promise.reject(error);
		}
	}

	eventsSetUp(walletCore: WalletCore) {
		walletCore.on('connect', () => this.handleConnect());
		walletCore.on('disconnect', () => this.handleDisconnect());
		walletCore.on('accountChange', () => this.handleAccountChange());
		walletCore.on('networkChange', () => this.handleAccountChange());
		walletCore.on('standardWalletsAdded', (wallet) => this.handleStandardWalletsAdded(wallet));
		walletCore.on('standardNotDetectedWalletAdded', (wallet) =>
			this.handleStandardNotDetectedWalletsAdded(wallet)
		);
	}

	eventsCleanUp(walletCore: WalletCore) {
		walletCore.off('connect', () => this.handleConnect());
		walletCore.off('disconnect', () => this.handleDisconnect());
		walletCore.off('accountChange', () => this.handleAccountChange());
		walletCore.off('networkChange', () => this.handleNetworkChange());
		walletCore.off('standardWalletsAdded', (wallet) => this.handleStandardWalletsAdded(wallet));
		walletCore.off('standardNotDetectedWalletAdded', (wallet) =>
			this.handleStandardNotDetectedWalletsAdded(wallet)
		);
	}
}

const WALLET_KEY = Symbol('APTOS_WALLET');

export function setWalletState(wallet: WalletState) {
	return setContext(WALLET_KEY, wallet);
}

export function getWalletState() {
	return getContext<ReturnType<typeof setWalletState>>(WALLET_KEY);
}
