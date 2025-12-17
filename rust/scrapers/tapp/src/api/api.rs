use anyhow::Result;
use serde::{Deserialize, Serialize};

const TAPP_API_BASE_URL: &str = "https://api.tapp.exchange/v1";

use super::models::*;

#[derive(Debug, Deserialize)]
struct ResponseResult<T> {
    data: T,
}

pub struct TappHttpClient {
    client: reqwest::Client,
    base_url: String,
    request_id: std::sync::atomic::AtomicU64,
}

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

#[derive(Serialize)]
struct Params<T> {
    query: T,
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

    /**  Get token list from TAPP API
     *  It seems tapp's using Fungible Assets with no regards for the older coin type. Careful
     */
    pub async fn get_token_list(&self, query: TokenListQuery) -> Result<Vec<TappApiToken>> {
        self.query("public/token", Params { query }).await
    }

    /// Get pool price chart data
    pub async fn get_pool_prices(&self, query: PoolPriceQuery) -> Result<Vec<PricePoint>> {
        self.query("public/pool_price_chart", Params { query })
            .await
    }

    pub async fn get_pools(&self, query: PoolsQuery) -> Result<Vec<Pool>> {
        self.query("public/pool", Params { query }).await
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
