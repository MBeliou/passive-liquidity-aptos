type TappAPIMethod = 'public/token';

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

		/*
		"params": {
    "query": {
      "keyword": "APT",
      "page": 1,
      "pageSize": 20,
      "startTime": 1742428856000,
      "endTime": 1742287927782
    }
  }*/
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
		console.dir(json);

		return json.result.data;
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
