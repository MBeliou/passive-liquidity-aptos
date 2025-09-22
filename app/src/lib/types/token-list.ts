export interface TokenListResponse {
  data: Token[]
  time: string
}

export interface Token {
  assetType: string
  coinType?: string
  faType: string
  coingeckoId: string
  coinMarketcapId: string
  decimals: number
  hyperfluidSymbol: string
  isBanned: boolean
  logoUrl: string
  name: string
  symbol: string
  bridge?: string
  tags?: string[]
  index?: number
}
