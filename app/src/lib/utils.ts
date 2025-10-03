import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function formatCurrency(amount: number, symbol: string) {
	const format = new Intl.NumberFormat(undefined, {
		style: 'decimal',
		maximumSignificantDigits: 5,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		minimumSignificantDigits: 2
	}).format(amount);

	return `${format} ${symbol}`;
}

export function convertTickBitsToSigned(bits: bigint): number {
	const MAX_I64 = BigInt(2) ** BigInt(63) - BigInt(1);
	const MAX_U64 = BigInt(2) ** BigInt(64);
	return bits > MAX_I64 ? Number(bits - MAX_U64) : Number(bits);
}
