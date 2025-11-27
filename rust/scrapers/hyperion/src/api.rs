use crate::types::{Network, PoolResponse, PositionResponse};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use serde_json::json;

pub struct HyperionGraphQLClient {
    client: reqwest::Client,
    graphql_url: String,
}

impl HyperionGraphQLClient {
    pub fn new(network: Network) -> Self {
        Self {
            client: reqwest::Client::new(),
            graphql_url: network.graphql_url().to_string(),
        }
    }

    /// Execute a GraphQL query
    async fn query<T>(&self, query: &str, variables: serde_json::Value) -> Result<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        #[derive(Serialize)]
        struct GraphQLRequest {
            query: String,
            variables: serde_json::Value,
        }

        #[derive(Deserialize)]
        struct GraphQLResponse<D> {
            data: Option<D>,
            errors: Option<Vec<GraphQLError>>,
        }

        #[derive(Deserialize)]
        struct GraphQLError {
            message: String,
        }

        let request = GraphQLRequest {
            query: query.to_string(),
            variables,
        };

        let response = self
            .client
            .post(&self.graphql_url)
            .json(&request)
            .send()
            .await?;

        let graphql_response: GraphQLResponse<T> = response.json().await?;

        if let Some(errors) = graphql_response.errors {
            let error_messages: Vec<String> = errors.iter().map(|e| e.message.clone()).collect();
            anyhow::bail!("GraphQL errors: {}", error_messages.join(", "));
        }

        graphql_response
            .data
            .ok_or_else(|| anyhow::anyhow!("No data in GraphQL response"))
    }

    /// Fetch all pools from GraphQL API
    pub async fn fetch_all_pools(&self) -> Result<Vec<PoolResponse>> {
        let query = r#"
            query GetAllPools {
                pools {
                    pool_id
                    token_a
                    token_b
                    fee_tier
                    tvl
                    volume_24h
                    apr
                }
            }
        "#;

        #[derive(Deserialize)]
        struct PoolsData {
            pools: Vec<PoolResponse>,
        }

        let result: PoolsData = self.query(query, json!({})).await?;
        Ok(result.pools)
    }

    /// Fetch pool by ID
    pub async fn fetch_pool_by_id(&self, pool_id: &str) -> Result<PoolResponse> {
        let query = r#"
            query GetPoolById($poolId: String!) {
                pool(where: { pool_id: { _eq: $poolId } }) {
                    pool_id
                    token_a
                    token_b
                    fee_tier
                    tvl
                    volume_24h
                    apr
                }
            }
        "#;

        #[derive(Deserialize)]
        struct PoolData {
            pool: Vec<PoolResponse>,
        }

        let result: PoolData = self
            .query(
                query,
                json!({
                    "poolId": pool_id
                }),
            )
            .await?;

        result
            .pool
            .into_iter()
            .next()
            .ok_or_else(|| anyhow::anyhow!("Pool not found"))
    }

    /// Fetch all positions by address
    pub async fn fetch_positions_by_address(&self, address: &str) -> Result<Vec<PositionResponse>> {
        let query = r#"
            query GetPositionsByAddress($address: String!) {
                positions(where: { owner: { _eq: $address } }) {
                    position_id
                    pool_id
                    owner
                    liquidity
                    tick_lower
                    tick_upper
                }
            }
        "#;

        #[derive(Deserialize)]
        struct PositionsData {
            positions: Vec<PositionResponse>,
        }

        let result: PositionsData = self
            .query(
                query,
                json!({
                    "address": address
                }),
            )
            .await?;

        Ok(result.positions)
    }

    /// Fetch positions by pool ID
    pub async fn fetch_positions_by_pool(&self, pool_id: &str) -> Result<Vec<PositionResponse>> {
        let query = r#"
            query GetPositionsByPool($poolId: String!) {
                positions(where: { pool_id: { _eq: $poolId } }) {
                    position_id
                    pool_id
                    owner
                    liquidity
                    tick_lower
                    tick_upper
                }
            }
        "#;

        #[derive(Deserialize)]
        struct PositionsData {
            positions: Vec<PositionResponse>,
        }

        let result: PositionsData = self
            .query(
                query,
                json!({
                    "poolId": pool_id
                }),
            )
            .await?;

        Ok(result.positions)
    }
}

impl Default for HyperionGraphQLClient {
    fn default() -> Self {
        Self::new(Network::Mainnet)
    }
}
