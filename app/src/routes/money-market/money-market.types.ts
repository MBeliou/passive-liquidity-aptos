export interface Data {
  assets: Asset[]
  emodes: Emode[]
  farming: Farming
  isolatedPoolFarming: IsolatedPoolFarming
  liquidationIncentive: number
  marketStats: [string, MarketStat][]
  /** Pools are isolated markets: 1 collateral, 1 liability. */
  pools: Pool[]
}

export interface Asset {
  address?: string
  symbol: string
  name: string
  coinGeckoName?: string
  decimals: number
  icon: string
  price: number
  market: string
  isFaMarket: boolean
  supplyApr: number
  borrowApr: number
  farmingApr: FarmingApr
  supplyCap: number
  borrowCap: number
  ltv: number
  lt: number
  veTokenMultiplier?: number
  href?: string
  faAddress?: string
  emodeLtv?: number
  emodeLt?: number
  stakingApr?: number
  extraAprs?: ExtraApr[]
}

export interface FarmingApr {
  supply: Supply[]
  borrow: Borrow[]
}

export interface Supply {
  coin: Coin
  apr: number
  campaignId: string
  startTimestamp: number
}

export interface Coin {
  address: string
  faAddress: string
  symbol: string
  name: string
  coinGeckoName: string
  decimals: number
  icon: string
}

export interface Borrow {
  coin: Coin2
  apr: number
  campaignId: string
  startTimestamp: number
}

export interface Coin2 {
  address: string
  faAddress: string
  symbol: string
  name: string
  coinGeckoName: string
  decimals: number
  icon: string
}

export interface ExtraApr {
  source: string
  icon?: string
  value: number
  type: string
}

export interface Emode {
  key: number
  liquidationIncentive: number
  markets: string[]
  collateralFactor: number
  lt: number
}

export interface Farming {
  rewards: [string, Reward][]
  pools: Pools
}

export interface Reward {
  rewardCoin: RewardCoin
  rewardPerSec: number
  totalAllocPoint: number
  startTime: number
  endTime: number
}

export interface RewardCoin {
  address?: string
  faAddress: string
  symbol: string
  name: string
  coinGeckoName: string
  decimals: number
  icon: string
  price: number
}

export interface Pools {
  borrow: [string, Borrow2][]
  supply: [string, Supply2][]
}

export interface Borrow2 {
  stakeAmount: number
  rewards: Reward2[]
}

export interface Reward2 {
  rewardKey: string
  allocPoint: number
}

export interface Supply2 {
  stakeAmount: number
  rewards: Reward3[]
}

export interface Reward3 {
  rewardKey: string
  allocPoint: number
}

export interface IsolatedPoolFarming {
  rewards: [string, Reward4][]
  pools: Pools2
}

export interface Reward4 {
  rewardCoin: RewardCoin2
  rewardPerSec: number
  totalAllocPoint: number
  startTime: number
  endTime: number
}

export interface RewardCoin2 {
  address: string
  faAddress: string
  symbol: string
  name: string
  coinGeckoName: string
  decimals: number
  icon: string
  price: number
}

export interface Pools2 {
  borrow: [string, Borrow3][]
  supply: [string, Supply3][]
  collateral: [string, Collateral][]
}

export interface Borrow3 {
  stakeAmount: number
  rewards: unknown[]
}

export interface Supply3 {
  stakeAmount: number
  rewards: Reward5[]
}

export interface Reward5 {
  rewardKey: string
  allocPoint: number
}

export interface Collateral {
  stakeAmount: number
  rewards: Reward6[]
}

export interface Reward6 {
  rewardKey: string
  allocPoint: number
}

export interface MarketStat {
  totalShares: number
  totalLiability: number
  totalReserve: number
  totalCash: number
}

export interface Pool {
  address: string
  isFungibleAsset: boolean
  collateralCoin: CollateralCoin
  liabilityCoin: LiabilityCoin
  totalSupply: number
  totalBorrow: number
  totalCollateral: number
  totalBorrowShares: number
  totalSupplyShares: number
  supplyApr: number
  borrowApr: number
  ltv: number
}

export interface CollateralCoin {
  faAddress?: string
  address?: string
  symbol: string
  name: string
  icon: string
  decimals: number
  price: number
  coinGeckoName?: string
}

export interface LiabilityCoin {
  address: string
  faAddress?: string
  symbol: string
  name: string
  coinGeckoName: string
  decimals: number
  icon: string
  price: number
}
