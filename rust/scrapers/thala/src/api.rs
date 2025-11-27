use crate::types::{ThalaPool, ThalaToken};
use anyhow::Result;
use serde::{Deserialize, Serialize};

pub struct ThalaHttpClient {
    client: reqwest::Client,
    // TODO: Research if Thala has an HTTP API
    // - Check for public REST endpoints
    // - Check for GraphQL endpoints
    // - Check for third-party indexers
    // base_url: String,
}

impl ThalaHttpClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
        }
    }

    // TODO: Implement token list fetching if API exists
    // Research needed:
    // 1. Does Thala have a public token list API?
    // 2. What's the endpoint and response format?
    pub async fn get_token_list(&self) -> Result<Vec<ThalaToken>> {
        anyhow::bail!("Thala API token list not yet implemented - research needed")
    }

    // TODO: Implement pool list fetching if API exists
    pub async fn get_pool_list(&self) -> Result<Vec<ThalaPool>> {
        anyhow::bail!("Thala API pool list not yet implemented - research needed")
    }
}

impl Default for ThalaHttpClient {
    fn default() -> Self {
        Self::new()
    }
}
