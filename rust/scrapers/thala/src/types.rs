use aptos_rust_sdk::client::config::AptosNetwork;
use serde::{Deserialize, Serialize};

// TODO: Research Thala's position data structure
// - Check if Thala uses CLMM like TAPP
// - Identify tick structure (if applicable)
// - Determine liquidity representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub index: String,
    pub liquidity: String,
    // TODO: Add tick ranges if Thala uses concentrated liquidity
    // pub tick_lower: Option<TickIndex>,
    // pub tick_upper: Option<TickIndex>,
}

// TODO: Research Thala's pool data structure
// - API endpoint or on-chain resource type
// - Fee structure
// - APR calculation method
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThalaPool {
    pub pool_id: String,
    pub fee: String,
    pub tvl: String,
    pub volume_24h: Option<String>,
    pub apr: Option<f64>,
    // TODO: Add token addresses
    // pub token_a: String,
    // pub token_b: String,
}

// TODO: Research Thala's token list format
// - Check if they have an HTTP API like TAPP
// - Or if token data comes from on-chain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThalaToken {
    pub address: String,
    pub symbol: String,
    pub decimals: u8,
    pub name: Option<String>,
    pub logo: Option<String>,
}

// Network configuration
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Network {
    Mainnet,
}

impl Network {
    pub fn to_aptos_network(&self) -> AptosNetwork {
        match self {
            Network::Mainnet => AptosNetwork::mainnet(),
        }
    }
}
