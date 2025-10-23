use aptos_rust_sdk::client::{self, config::AptosNetwork, rest_api::AptosFullnodeClient};

use crate::types::Network;

pub struct TappClient {
    aptos_client: AptosFullNodeClient,
    view_address: String,
    network: Network,
    // NOTE: We're not dealing with router for now
}

impl TappClient {
    pub fn new(aptos_client: AptosFullnodeClient, network: Network) -> Self {
        let view_address = match network {
            Network::Mainnet => "0xMAINNET_ADDRESS".to_string(),
            Network::Testnet => "0xTESTNET_ADDRESS".to_string(),
        };

        Self {
            aptos_client,
            view_address,
            network,
        }
    }

    pub fn with_custom_address(
        network: Network,
        aptos_client: AptosClient,
        dex_address: String,
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
}
