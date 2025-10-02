import type { Daum } from '$lib/shared/tapp/api';

/**
 * Calculate logarithmic returns from a price series
 * Log returns are additive and better for volatility calculation
 */
export function calculateLogReturns(prices: number[]): number[] {
	const returns: number[] = [];
	for (let i = 1; i < prices.length; i++) {
		if (prices[i - 1] > 0 && prices[i] > 0) {
			returns.push(Math.log(prices[i] / prices[i - 1]));
		}
	}
	return returns;
}

/**
 * Calculate annualized volatility from returns
 * @param returns - Array of log returns
 * @param hoursInPeriod - Number of hours the returns span
 * @returns Annualized volatility as a percentage
 */
export function calculateVolatility(returns: number[], hoursInPeriod: number): number {
	if (returns.length < 2) return 0;

	// Calculate mean
	const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;

	// Calculate variance
	const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

	// Standard deviation (volatility)
	const stdDev = Math.sqrt(variance);

	// Annualize: multiply by sqrt of periods per year
	// Hours in a year: 24 * 365 = 8760
	const hoursPerYear = 8760;
	const periodsPerYear = hoursPerYear / hoursInPeriod;
	const annualizedVolatility = stdDev * Math.sqrt(periodsPerYear);

	// Return as percentage
	return annualizedVolatility * 100;
}

/**
 * Classify volatility level
 * Thresholds are rough estimates for DeFi assets
 */
export function getVolatilityLevel(volatility: number): 'low' | 'moderate' | 'high' {
	if (volatility < 30) return 'low';
	if (volatility < 60) return 'moderate';
	return 'high';
}

/**
 * Determine volatility trend by comparing recent to baseline
 */
export function getVolatilityTrend(
	recent: number,
	baseline: number
): 'increasing' | 'decreasing' | 'stable' {
	const threshold = 0.15; // 15% change threshold
	const change = (recent - baseline) / baseline;

	if (change > threshold) return 'increasing';
	if (change < -threshold) return 'decreasing';
	return 'stable';
}

/**
 * Generate user-friendly insight message
 */
export function generateVolatilityInsight(
	level: 'low' | 'moderate' | 'high',
	trend: 'increasing' | 'decreasing' | 'stable'
): string {
	const levelMessages = {
		low: 'Low volatility',
		moderate: 'Moderate volatility',
		high: 'High volatility'
	};

	const trendMessages = {
		increasing: 'increasing',
		decreasing: 'decreasing',
		stable: 'stable'
	};

	const baseMessage = levelMessages[level];

	if (trend === 'stable') {
		return `${baseMessage} - ${trendMessages[trend]} conditions`;
	}

	return `${baseMessage} - volatility ${trendMessages[trend]}`;
}

export interface VolatilityAnalysis {
	week: number;
	day: number;
	hour: number;
	trend: 'increasing' | 'decreasing' | 'stable';
	level: 'low' | 'moderate' | 'high';
	insight: string;
}

/**
 * Analyze volatility from price data
 * @param priceData - Array of price data points with x (timestamp) and y (price)
 * @returns Volatility analysis with metrics and insights
 */
export function analyzeVolatility(priceData: Daum[]): VolatilityAnalysis {
	if (priceData.length < 2) {
		return {
			week: 0,
			day: 0,
			hour: 0,
			trend: 'stable',
			level: 'low',
			insight: 'Insufficient data for volatility analysis'
		};
	}

	// Extract prices
	const prices = priceData.map((d) => parseFloat(d.y));

	// Calculate week volatility (all data - assuming 7 days of hourly data)
	const weekReturns = calculateLogReturns(prices);
	const weekVolatility = calculateVolatility(weekReturns, priceData.length);

	// Calculate day volatility (last 24 hours)
	const dayPrices = prices.slice(-24);
	const dayReturns = calculateLogReturns(dayPrices);
	const dayVolatility = calculateVolatility(dayReturns, 24);

	// Calculate hour volatility (last 12 hours for more stable estimate)
	const hourPrices = prices.slice(-12);
	const hourReturns = calculateLogReturns(hourPrices);
	const hourVolatility = calculateVolatility(hourReturns, 12);

	// Determine trend and level
	const trend = getVolatilityTrend(dayVolatility, weekVolatility);
	const level = getVolatilityLevel(weekVolatility);
	const insight = generateVolatilityInsight(level, trend);

	return {
		week: Math.round(weekVolatility * 100) / 100,
		day: Math.round(dayVolatility * 100) / 100,
		hour: Math.round(hourVolatility * 100) / 100,
		trend,
		level,
		insight
	};
}
