use anyhow::Result;
use serde::{Deserialize, Serialize};

const TAPP_API_BASE_URL: &str = "https://api.tapp.exchange/v1";

/// JSON-RPC 2.0 request structure
#[derive(Debug, Serialize)]
struct JsonRpcRequest<T> {
    jsonrpc: String,
    id: u64,
    method: String,
    params: T,
}

/// JSON-RPC 2.0 response structure
#[derive(Debug, Deserialize)]
struct JsonRpcResponse<T> {
    jsonrpc: String,
    id: u64,
    method: String,
    result: ResponseResult<T>,
}

#[derive(Debug, Deserialize)]
struct ResponseResult<T> {
    data: T,
}

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


pub struct TappHttpClient {
    client: reqwest::Client,
    base_url: String,
    request_id: std::sync::atomic::AtomicU64,
}

impl TappHttpClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            base_url: TAPP_API_BASE_URL.to_string(),
            request_id: std::sync::atomic::AtomicU64::new(0),
        }
    }

    fn next_id(&self) -> u64 {
        self.request_id
            .fetch_add(1, std::sync::atomic::Ordering::SeqCst)
    }

    async fn query<T, P>(&self, method: &str, params: P) -> Result<T>
    where
        T: for<'de> Deserialize<'de>,
        P: Serialize,
    {
        let request = JsonRpcRequest {
            jsonrpc: "2.0".to_string(),
            id: self.next_id(),
            method: method.to_string(),
            params,
        };

        let response = self
            .client
            .post(&self.base_url)
            .json(&request)
            .send()
            .await?;

        let json_response: JsonRpcResponse<T> = response.json().await?;
        Ok(json_response.result.data)
    }

    /// Get token list from TAPP API
    pub async fn get_token_list(&self, query: TokenListQuery) -> Result<Vec<TappApiToken>> {
        #[derive(Serialize)]
        struct Params {
            query: TokenListQuery,
        }

        self.query("public/token", Params { query }).await
    }

    /// Get pool price chart data
    pub async fn get_pool_prices(&self, query: PoolPriceQuery) -> Result<Vec<PricePoint>> {
        #[derive(Serialize)]
        struct Params {
            query: PoolPriceQuery,
        }

        self.query("public/pool_price_chart", Params { query })
            .await
    }
}

impl Default for TappHttpClient {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_token_list() {
        let client = TappHttpClient::new();
        let query = TokenListQuery {
            start_time: None,
            end_time: None,
            keyword: None,
            page: Some(1),
            page_size: Some(10),
        };

        let result = client.get_token_list(query).await;
        assert!(result.is_ok());
        let tokens = result.unwrap();
        assert!(!tokens.is_empty());
    }
}
