use crate::types::{Network, Position};
use anyhow::Result;
use aptos_rust_sdk::client::{
    builder::AptosClientBuilder, rest_api::AptosFullnodeClient,
};
use aptos_rust_sdk_types::api_types::view::ViewRequest;
use serde_json::Value;

pub struct TappChainClient {
    aptos_client: AptosFullnodeClient,
    view_address: String,
    network: Network,
    // NOTE: We're not dealing with router for now
}

impl TappChainClient {
    pub fn new(aptos_client: AptosFullnodeClient, network: Network) -> Self {
        let view_address = match network {
            Network::Mainnet => {
                "0xf5840b576a3a6a42464814bc32ae1160c50456fb885c62be389b817e75b2a385".to_string()
            } 
        };

        Self {
            aptos_client,
            view_address,
            network,
        }
    }

    pub fn with_custom_address(
        network: Network,
        aptos_client: AptosFullnodeClient,
        view_address: String,
    ) -> Self {
        Self {
            aptos_client,
            network,
            view_address,
        }
    }

    pub fn from_network(network: Network) -> Self {
        let builder = AptosClientBuilder::new(network.to_aptos_network());
        let aptos_client = builder.build();

        TappChainClient::new(aptos_client, network)
    }

    pub fn network(&self) -> Network {
        self.network
    }

    pub async fn fetch_positions(&self, pool_id: &str) -> Result<Vec<Position>> {
        // NOTE: we'd want to move this away into a query builder of some sort so we'd only need to pass the viewRequest around
        let query = self
            .aptos_client
            .view_function(ViewRequest {
                arguments: vec![Value::String(pool_id.to_string())],
                function: format!("{}::clmm_views::get_positions", self.view_address),
                type_arguments: vec![],
            })
            .await?;

        let mut response = query.into_inner();

        Ok(serde_json::from_value(response[0].take())?)
    }

    /// Get the current tick index for a pool
    pub async fn get_current_tick_index(&self, pool_id: &str) -> Result<i64> {
        let query = self
            .aptos_client
            .view_function(ViewRequest {
                arguments: vec![Value::String(pool_id.to_string())],
                function: format!("{}::clmm_views::current_tick_idx", self.view_address),
                type_arguments: vec![],
            })
            .await?;

        let response = query.into_inner();
        let tick_str = response[0].as_str().ok_or_else(|| {
            anyhow::anyhow!("Expected string for tick index")
        })?;

        Ok(tick_str.parse()?)
    }

    
}

/// Convert unsigned tick bits to signed tick value
///
/// TAPP uses u64 for ticks on-chain, but they represent signed i64 values.
/// This function converts the unsigned representation to the correct signed value.
pub fn convert_tick_bits_to_signed(bits: u64) -> i64 {
    const MAX_I64: u64 = i64::MAX as u64;

    // If it's larger than max signed 64-bit, it's actually negative
    if bits > MAX_I64 {
        // Two's complement conversion
        (bits as i64).wrapping_sub(0)
    } else {
        bits as i64
    }
}
