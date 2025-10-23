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
