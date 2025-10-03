export interface TickIndex {
	bits: string;
}

export type Position = {
	fee_growth_inside_a: string;
	fee_growth_inside_b: string;
	fee_owed_a: string;
	fee_owed_b: string;
	index: string;
	liquidity: string;
	tick_lower_index: TickIndex;
	tick_upper_index: TickIndex;
};

export type TappApiApr = {
	boostedAprPercentage: number;
	campaignAprs: CampaignApr[];
	feeAprPercentage: number;
	totalAprPercentage: number;
};
export type CampaignApr = {
	aprPercentage: number;
	campaignIdx: number;
	token: TappAPIToken;
};

export type TappAPIToken = {
	addr: string;
	color: string;
	decimals: number;
	img: string;
	symbol: string;
	verified: boolean;
};
