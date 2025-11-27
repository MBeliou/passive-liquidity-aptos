use crate::types::{HyperionPool, Network, Position};
use anyhow::Result;
use aptos_rust_sdk::client::{
    builder::AptosClientBuilder, rest_api::AptosFullnodeClient,
};
use aptos_rust_sdk_types::api_types::view::ViewRequest;
use serde_json::Value;

/// Hyperion protocol addresses on Aptos
const MAINNET_PROTOCOL: &str = "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c";
const TESTNET_PROTOCOL: &str = "0x69faed94da99abb7316cb3ec2eeaa1b961a47349fad8c584f67a930b0d14fec7";

pub struct HyperionClient {
    aptos_client: AptosFullnodeClient,
    protocol_address: String,
    network: Network,
}

impl HyperionClient {
    pub fn new(aptos_client: AptosFullnodeClient, network: Network) -> Self {
        let protocol_address = match network {
            Network::Mainnet => MAINNET_PROTOCOL.to_string(),
            Network::Testnet => TESTNET_PROTOCOL.to_string(),
        };

        Self {
            aptos_client,
            protocol_address,
            network,
        }
    }

    pub fn from_network(network: Network) -> Self {
        let builder = AptosClientBuilder::new(network.to_aptos_network());
        let aptos_client = builder.build();

        HyperionClient::new(aptos_client, network)
    }

    pub fn network(&self) -> Network {
        self.network
    }

    /// Fetch position token amounts by position ID
    /// Uses pool_v3::get_amount_by_liquidity view function
    pub async fn get_position_amounts(
        &self,
        position_id: &str,
    ) -> Result<(String, String)> {
        let query = self
            .aptos_client
            .view_function(ViewRequest {
                arguments: vec![Value::String(position_id.to_string())],
                function: format!("{}::pool_v3::get_amount_by_liquidity", self.protocol_address),
                type_arguments: vec![],
            })
            .await?;

        let response = query.into_inner();

        let amount_a = response.get(0)
            .and_then(|v| v.as_str())
            .unwrap_or("0")
            .to_string();
        let amount_b = response.get(1)
            .and_then(|v| v.as_str())
            .unwrap_or("0")
            .to_string();

        Ok((amount_a, amount_b))
    }

    /// Fetch pending fees for a position
    /// Note: May be deprecated, check if function still exists
    pub async fn get_pending_fees(
        &self,
        position_id: &str,
    ) -> Result<(String, String)> {
        let query = self
            .aptos_client
            .view_function(ViewRequest {
                arguments: vec![Value::String(position_id.to_string())],
                function: format!("{}::pool_v3::get_pending_fees", self.protocol_address),
                type_arguments: vec![],
            })
            .await?;

        let response = query.into_inner();

        let fee_a = response.get(0)
            .and_then(|v| v.as_str())
            .unwrap_or("0")
            .to_string();
        let fee_b = response.get(1)
            .and_then(|v| v.as_str())
            .unwrap_or("0")
            .to_string();

        Ok((fee_a, fee_b))
    }

    /// Fetch pool resource directly from chain
    /// Resource type: pool_v3::LiquidityPoolV3
    pub async fn fetch_pool_resource(&self, pool_id: &str) -> Result<HyperionPool> {
        let resource_type = format!("{}::pool_v3::LiquidityPoolV3", self.protocol_address);

        let resources = self
            .aptos_client
            .get_account_resources(pool_id.to_string())
            .await?;

        let pool_resource = resources
            .into_inner()
            .into_iter()
            .find(|r| r.type_ == resource_type)
            .ok_or_else(|| anyhow::anyhow!("Pool resource not found"))?;

        let pool: HyperionPool = serde_json::from_value(pool_resource.data)?;
        Ok(pool)
    }

    /// Fetch position resource directly from chain
    /// Resource type: pool_v3::Info
    pub async fn fetch_position_resource(&self, position_id: &str) -> Result<Position> {
        let resource_type = format!("{}::pool_v3::Info", self.protocol_address);

        let resources = self
            .aptos_client
            .get_account_resources(position_id.to_string())
            .await?;

        let position_resource = resources
            .into_inner()
            .into_iter()
            .find(|r| r.type_ == resource_type)
            .ok_or_else(|| anyhow::anyhow!("Position resource not found"))?;

        let position: Position = serde_json::from_value(position_resource.data)?;
        Ok(position)
    }

    /// Get current tick from pool
    pub async fn get_current_tick(&self, pool_id: &str) -> Result<i32> {
        let pool = self.fetch_pool_resource(pool_id).await?;
        let tick_value = pool.tick.value.parse::<i32>()?;
        Ok(tick_value)
    }
}
