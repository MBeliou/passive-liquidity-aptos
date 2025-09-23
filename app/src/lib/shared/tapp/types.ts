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
