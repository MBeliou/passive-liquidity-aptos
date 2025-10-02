import { getContext, setContext } from 'svelte';

export type ShareButtonConfig = {
	title?: string;
	description?: string;
	url?: string;
};

export class TabBarState {
	shareButton = $state<ShareButtonConfig | null>(null);
	backButton = $state<string | null>(null);

	setShareButton(config: ShareButtonConfig) {
		this.shareButton = config;
	}

	clearShareButton() {
		this.shareButton = null;
	}

	setBackButton(url?: string) {
		this.backButton = url || '/';
	}

	clearBackButton() {
		this.backButton = null;
	}
}

const TAB_BAR_STATE_KEY = Symbol('TAB_BAR_STATE');

export function setTabBarState(state: TabBarState) {
	return setContext(TAB_BAR_STATE_KEY, state);
}

export function getTabBarState() {
	return getContext<ReturnType<typeof setTabBarState>>(TAB_BAR_STATE_KEY);
}
