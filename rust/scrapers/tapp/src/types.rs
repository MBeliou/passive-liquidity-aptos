use aptos_rust_sdk::client::config::AptosNetwork;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TickIndex {
    pub bits: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub fee_growth_inside_a: String,
    pub fee_growth_inside_b: String,
    pub fee_owed_a: String,
    pub fee_owed_b: String,
    pub index: String,
    pub liquidity: String,
    pub tick_lower_index: TickIndex,
    pub tick_upper_index: TickIndex,
}

/// APR data from TAPP API/SDK
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TappApiApr {
    #[serde(rename = "boostedAprPercentage")]
    pub boosted_apr_percentage: f64,
    #[serde(rename = "campaignAprs")]
    pub campaign_aprs: Vec<CampaignApr>,
    #[serde(rename = "feeAprPercentage")]
    pub fee_apr_percentage: f64,
    #[serde(rename = "totalAprPercentage")]
    pub total_apr_percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampaignApr {
    #[serde(rename = "aprPercentage")]
    pub apr_percentage: f64,
    #[serde(rename = "campaignIdx")]
    pub campaign_idx: u32,
    pub token: TappApiToken,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TappApiToken {
    pub addr: String,
    pub color: String,
    pub decimals: u8,
    pub img: String,
    pub symbol: String,
    pub verified: bool,
}

/// Volume data from pool
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VolumeData {
    #[serde(rename = "volume24h")]
    pub volume_24h: String,
    #[serde(rename = "volume7d")]
    pub volume_7d: String,
    #[serde(rename = "volume30d")]
    pub volume_30d: String,
    #[serde(rename = "volumeprev24h")]
    pub volume_prev_24h: String,
}

/// Token info in pool data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PoolToken {
    pub addr: String,
    pub decimals: u8,
    pub img: String,
    pub symbol: String,
    pub verified: bool,
}

/// Pool data from TAPP SDK - used when fetching from external API
/// This matches the structure returned by the @tapp-exchange/sdk
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TappSdkPool {
    pub pool_id: String,
    pub fee_tier: String, // Decimal as string
    pub apr: serde_json::Value, // Will be parsed as TappApiApr
    pub tvl: String,
    pub volume_data: VolumeData,
    pub tokens: Vec<PoolToken>,
}

// Network related
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Network {
    Mainnet,
    // NOTE: No public testnet deployment
    //Testnet,
}

impl Network {
    pub fn to_aptos_network(&self) -> AptosNetwork {
        match self {
            Network::Mainnet => AptosNetwork::mainnet(),
            //Network::Testnet => AptosNetwork::testnet(),
        }
    }
}
