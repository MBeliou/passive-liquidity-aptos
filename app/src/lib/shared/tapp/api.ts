type TappAPIMethod = 'public/token' | 'public/pool_price_chart';

export class TappAPI {
	#baseURL = 'https://api.tapp.exchange/v1';
	#id = 0;

	async getTokenList(params: {
		keyword?: string;
		page?: number;
		pageSize?: number;
		startCreationTime?: number;
		endCreationTime?: number;
	}) {
		const query = {
			startTime: params.startCreationTime || 0,
			endTime: params.endCreationTime || 0,
			keyword: params.keyword,
			page: params.page,
			pageSize: params.pageSize
		};

		return await this.query<Token[]>('public/token', {
			query
		});
	}

	async getPoolPrices(
		poolId: string,
		startTime: number,
		endTime: number,
		interval: '1h' | '4h' | '1d'
	) {
		/* "params":{"query":{"poolId":"0x4ed8fda291b604491ead0cc9e5232bc1edc1f31d0e0cf343be043d8c792af1a8",
		"startTime":1759233600000,
		"endTime":1759323599999,"interval":"1h"}}}*/
		const query = {
			poolId,
			startTime,
			endTime,
			interval
		};

		const response = await this.query<Daum[]>('public/pool_price_chart', {
			query
		});

		return response;
		/*
		query: {"method":"public/pool_price_chart",
		"jsonrpc":"2.0",
		"id":252841082,
		"params":{"query":{"poolId":"0x4ed8fda291b604491ead0cc9e5232bc1edc1f31d0e0cf343be043d8c792af1a8","startTime":1759233600000,"endTime":1759323599999,"interval":"1h"}}}
		interval: 1h / 4h / 1d
		
		response: {"jsonrpc":"2.0","id":252841082,"method":"public/pool_price_chart","result":{"data":[{"x":"2025-09-30T12:00:00Z","y":"4.28519068"},{"x":"2025-09-30T13:00:00Z","y":"4.24858024"},{"x":"2025-09-30T14:00:00Z","y":"4.28167172"},{"x":"2025-09-30T15:00:00Z","y":"4.27797956"},{"x":"2025-09-30T16:00:00Z","y":"4.24924804"},{"x":"2025-09-30T17:00:00Z","y":"4.23463784"},{"x":"2025-09-30T18:00:00Z","y":"4.22386226"},{"x":"2025-09-30T19:00:00Z","y":"4.28223094"},{"x":"2025-09-30T20:00:00Z","y":"4.33953656"},{"x":"2025-09-30T21:00:00Z","y":"4.36635811"},{"x":"2025-09-30T22:00:00Z","y":"4.37593562"},{"x":"2025-09-30T23:00:00Z","y":"4.37857830"},{"x":"2025-10-01T00:00:00Z","y":"4.42007973"},{"x":"2025-10-01T01:00:00Z","y":"4.46184671"},{"x":"2025-10-01T02:00:00Z","y":"4.49121321"},{"x":"2025-10-01T03:00:00Z","y":"4.45466270"},{"x":"2025-10-01T04:00:00Z","y":"4.42517582"},{"x":"2025-10-01T05:00:00Z","y":"4.44395492"},{"x":"2025-10-01T06:00:00Z","y":"4.42371162"},{"x":"2025-10-01T07:00:00Z","y":"4.39248235"},{"x":"2025-10-01T08:00:00Z","y":"4.43816790"},{"x":"2025-10-01T09:00:00Z","y":"4.54133269"},{"x":"2025-10-01T10:00:00Z","y":"4.59282166"},{"x":"2025-10-01T11:00:00Z","y":"4.59868319"},{"x":"2025-10-01T12:00:00Z","y":"4.61056659"}]},"usIn":1759322381346508,"usOut":1759322381346848,"usDiff":340}
		*/
	}

	async query<T>(method: TappAPIMethod, content: Record<string, unknown>): Promise<T> {
		const resp = await fetch(this.#baseURL, {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: this.#id,
				method,
				params: content
			})
		});
		this.#id++;

		const json = (await resp.json()) as {
			jsonrpc: string;
			id: number;
			method: typeof method;
			result: { data: T };
		};

		return 'data' in json.result ? json.result.data : json.result;
	}
}

type Token = {
	addr: string;
	color: string;
	createdAt: string;
	decimals: number;
	img: string;
	isVerified: boolean;
	name: string;
	price: string;
	price1hPercentage: string;
	price24hPercentage: string;
	price30dPercentage: string;
	price7dPercentage: string;
	priceData: PriceData;
	ticker: string;
	tvl: string;
	txnCount: string;
	volume: string;
};

export interface PriceData {
	price1h: number;
	price24h: number;
	price30d: number;
	price7d: number;
}

export interface GetPoolPricesResponse {
	data: Daum[];
}

export interface Daum {
	x: string;
	y: string;
}
