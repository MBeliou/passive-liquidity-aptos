export interface MesoResponse {
  datas: Data[]
  total: number
  totalPages: number
}

export interface Data {
  _id: string
  poolAddress: string
  __v: number
  baseBps: number
  borrowApy: number
  borrowCap: number
  borrowFeeBps: number
  borrowRewardsPool: string
  closeFactorBps: number
  createdAt: string
  emodeBps: number
  emodeId: string
  emodeLiquidationThresholdBps: number
  fungibleAsset: string
  incentiveBorrowApy: number
  incentiveSupplyApy: number
  isPaused: boolean
  liquidationFeeBps: number
  liquidationThresholdBps: number
  maxBps: number
  normaBps: number
  optimalBps: number
  optimalUtilizationBps: number
  poolSupply: number
  protocolInterestFeeBps: number
  protocolLiquidationFeeBps: number
  supplyApy: number
  supplyCap: number
  supplyRewardsPool: string
  token: Token
  tokenAddress: string
  totalDebt: number
  totalDebtShares: number
  totalFees: number
  totalReserves: number
  totalSupplyShares: number
  updatedAt: string
  stakingApr: number
  orderValue?: number
}

export interface Token {
  _id: string
  symbol: string
  name: string
  address: string
  decimals: number
  type: string
  wrapAddress: string
  createdAt: string
  updatedAt: string
  __v: number
  price: number
  icon_uri?: string
  project_uri?: string
}
