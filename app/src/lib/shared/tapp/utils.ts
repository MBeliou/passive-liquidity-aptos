export interface TickData {
	tickLowerBits: string | bigint;
	tickUpperBits: string | bigint;
	decimalsA: number;
	decimalsB: number;
}

export interface PriceBounds {
	priceLower: number;
	priceUpper: number;
}

/**
 * Calculate price bounds from raw tick data for Tapp Exchange V3 positions
 *
 * @param tickData - Raw tick bits and token decimals
 * @returns Price bounds in tokenB per tokenA
 */
export function calculatePriceBounds(tickData: TickData): PriceBounds {
	// Convert inputs to BigInt if they're strings
	const tickLowerBits =
		typeof tickData.tickLowerBits === 'string'
			? BigInt(tickData.tickLowerBits)
			: tickData.tickLowerBits;

	const tickUpperBits =
		typeof tickData.tickUpperBits === 'string'
			? BigInt(tickData.tickUpperBits)
			: tickData.tickUpperBits;

	// Constants for two's complement conversion
	const MAX_I64 = BigInt(2) ** BigInt(63) - BigInt(1);
	const MAX_U64 = BigInt(2) ** BigInt(64);

	// Convert tick bits to signed integers (two's complement)
	const tickLower =
		tickLowerBits > MAX_I64 ? Number(tickLowerBits - MAX_U64) : Number(tickLowerBits);

	const tickUpper =
		tickUpperBits > MAX_I64 ? Number(tickUpperBits - MAX_U64) : Number(tickUpperBits);

	// Calculate decimal adjustment factor
	const decimalAdjustment = Math.pow(10, tickData.decimalsA - tickData.decimalsB);

	// Calculate price bounds from ticks
	// Formula: price = 1.0001^tick × 10^(decimalsA - decimalsB)
	const priceLower = Math.pow(1.0001, tickLower) * decimalAdjustment;
	const priceUpper = Math.pow(1.0001, tickUpper) * decimalAdjustment;

	return {
		priceLower,
		priceUpper
	};
}

interface SqrtPriceData {
	sqrtPrice: string | bigint;
	decimalsA: number;
	decimalsB: number;
}

/**
 * Convert Q64-encoded sqrt price to regular price
 *
 * @param data - Sqrt price and token decimals
 * @returns Price in tokenB per tokenA
 */
export function sqrtPriceToPrice(data: SqrtPriceData): number {
	// Convert to BigInt if string
	const sqrtPriceRaw = typeof data.sqrtPrice === 'string' ? BigInt(data.sqrtPrice) : data.sqrtPrice;

	// Q64 constant (2^64)
	const Q64 = BigInt(2) ** BigInt(64);

	// Decode sqrt price from Q64 format
	const sqrtPrice = Number(sqrtPriceRaw) / Number(Q64);

	// Square to get the price ratio
	const priceRaw = sqrtPrice ** 2;

	// Apply decimal adjustment
	const decimalAdjustment = Math.pow(10, data.decimalsA - data.decimalsB);
	const price = priceRaw * decimalAdjustment;

	return price;
}
