use serde::{Deserialize, Serialize};
use serde_json::Value;



/// Query parameters for token list
#[derive(Debug, Serialize)]
pub struct TokenListQuery {
    #[serde(rename = "startTime", skip_serializing_if = "Option::is_none")]
    pub start_time: Option<u64>,
    #[serde(rename = "endTime", skip_serializing_if = "Option::is_none")]
    pub end_time: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub keyword: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<u32>,
    #[serde(rename = "pageSize", skip_serializing_if = "Option::is_none")]
    pub page_size: Option<u32>,
}

/// Query parameters for pool price chart
#[derive(Debug, Serialize)]
pub struct PoolPriceQuery {
    #[serde(rename = "poolId")]
    pub pool_id: String,
    #[serde(rename = "startTime")]
    pub start_time: u64,
    #[serde(rename = "endTime")]
    pub end_time: u64,
    pub interval: PriceInterval,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum PoolType {
    Amm,
    Clmm,
    Stable,
}

#[derive(Serialize, Deserialize)]
pub struct PoolsQuery {
    #[serde(rename = "poolType")]
    pub pool_type: PoolType,
    pub page: usize,
    #[serde(rename = "pageSize")]
    pub page_size: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum PriceInterval {
    #[serde(rename = "1h")]
    OneHour,
    #[serde(rename = "4h")]
    FourHours,
    #[serde(rename = "1d")]
    OneDay,
}

/// Token information from TAPP API
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TappApiToken {
    pub addr: String,
    pub color: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub decimals: u8,
    pub img: String,
    #[serde(rename = "isVerified")]
    pub is_verified: bool,
    pub name: String,
    pub price: String,
    #[serde(rename = "price1hPercentage")]
    pub price_1h_percentage: String,
    #[serde(rename = "price24hPercentage")]
    pub price_24h_percentage: String,
    #[serde(rename = "price30dPercentage")]
    pub price_30d_percentage: String,
    #[serde(rename = "price7dPercentage")]
    pub price_7d_percentage: String,
    #[serde(rename = "priceData")]
    pub price_data: PriceData,
    pub ticker: String,
    pub tvl: String,
    #[serde(rename = "txnCount")]
    pub txn_count: String,
    pub volume: String,
}

pub struct TappApiPool {
    
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PriceData {
    #[serde(rename = "price1h")]
    pub price_1h: f64,
    #[serde(rename = "price24h")]
    pub price_24h: f64,
    #[serde(rename = "price30d")]
    pub price_30d: f64,
    #[serde(rename = "price7d")]
    pub price_7d: f64,
}

/// Price chart data point
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PricePoint {
    pub x: String, // ISO 8601 timestamp
    pub y: String, // Price as string
}


#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Pool {
    pub apr: Apr,
    pub created_at: String,
    pub fee: String,
    pub fee_tier: String,
    pub pool_id: String,
    pub pool_type: String,
    pub tokens: Vec<Token>,
    pub tvl: String,
    pub txns: String,
    pub volume: String,
    pub volume_data: VolumeData,
    pub volume_percentage24h: String,
    pub volume_percentage30d: String,
    pub volume_percentage7d: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Apr {
    pub boosted_apr_percentage: f64,
    pub campaign_aprs: Vec<Value>,
    pub fee_apr_percentage: f64,
    pub total_apr_percentage: f64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Token {
    pub addr: String,
    pub amount: f64,
    pub color: String,
    pub img: String,
    pub reserve: i64,
    pub symbol: String,
    pub verified: bool,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VolumeData {
    pub volume24h: f64,
    pub volume30d: f64,
    pub volume7d: f64,
    pub volumeprev24h: f64,
}
