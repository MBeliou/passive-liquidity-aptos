use aptos_rust_sdk::client::config::AptosNetwork;
use serde::{Deserialize, Serialize};

/// Position data from Hyperion CLMM
/// Maps to pool_v3::Info resource
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub initialized: bool,
    pub liquidity: String,
    pub tick_lower: I32Type,
    pub tick_upper: I32Type,
    pub fee_growth_inside_a_last: String,
    pub fee_growth_inside_b_last: String,
    pub fee_owed_a: String,
    pub fee_owed_b: String,
    pub token_a: TokenMetadata,
    pub token_b: TokenMetadata,
    pub fee_tier: u8,
}

/// I32 type representation from Hyperion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct I32Type {
    pub value: String, // Signed integer as string
}

/// Token metadata object reference
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenMetadata {
    pub inner: String, // Object address
}

/// Pool data from Hyperion CLMM (LiquidityPoolV3 resource)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HyperionPool {
    pub sqrt_price: String,
    pub liquidity: String,
    pub tick: I32Type,
    pub token_a: TokenMetadata,
    pub token_b: TokenMetadata,
    pub fee_tier: u8,
}

/// GraphQL response for pools
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PoolResponse {
    pub pool_id: String,
    pub token_a: String,
    pub token_b: String,
    pub fee_tier: String,
    pub tvl: Option<f64>,
    pub volume_24h: Option<f64>,
    pub apr: Option<f64>,
}

/// GraphQL response for positions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionResponse {
    pub position_id: String,
    pub pool_id: String,
    pub owner: String,
    pub liquidity: String,
    pub tick_lower: i32,
    pub tick_upper: i32,
}

/// Token information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HyperionToken {
    pub address: String,
    pub symbol: String,
    pub decimals: u8,
    pub name: Option<String>,
    pub logo_url: Option<String>,
}

// Network configuration
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Network {
    Mainnet,
    Testnet,
}

impl Network {
    pub fn to_aptos_network(&self) -> AptosNetwork {
        match self {
            Network::Mainnet => AptosNetwork::mainnet(),
            Network::Testnet => AptosNetwork::testnet(),
        }
    }

    pub fn graphql_url(&self) -> &'static str {
        match self {
            Network::Mainnet => "https://api.hyperion.xyz/v1/graphql",
            Network::Testnet => "https://api-testnet.hyperion.xyz/v1/graphql",
        }
    }
}
