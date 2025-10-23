use crate::types::{Network, Position};
use anyhow::Result;
use aptos_rust_sdk::client::{self, config::AptosNetwork, rest_api::AptosFullnodeClient};
use aptos_rust_sdk_types::api_types::view::ViewRequest;
use serde_json::Value;

pub struct TappClient {
    aptos_client: AptosFullnodeClient,
    view_address: String,
    network: Network,
    // NOTE: We're not dealing with router for now
}

impl TappClient {
    pub fn new(aptos_client: AptosFullnodeClient, network: Network) -> Self {
        let view_address = match network {
            Network::Mainnet => {
                "0xf5840b576a3a6a42464814bc32ae1160c50456fb885c62be389b817e75b2a385".to_string()
            } //Network::Testnet => "0xTESTNET_ADDRESS".to_string(),
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
}
