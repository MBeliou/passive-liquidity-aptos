export const MONEY_MARKETS = ['echelon', 'meso'] as const;
export type MoneyMarket = (typeof MONEY_MARKETS)[number];
