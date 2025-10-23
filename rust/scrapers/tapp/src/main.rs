mod scraper;
mod types;

use anyhow::Result;
use aptos_rust_sdk::client::builder::AptosClientBuilder;
use aptos_rust_sdk::client::config::AptosNetwork;

use scraper::TappClient;
use types::Network;

#[tokio::main]
async fn main() -> Result<()> {
    println!("Starting Tapp scrapper.");

    let builder = AptosClientBuilder::new(AptosNetwork::mainnet());
    let aptos_client = builder.build();

    let client = TappClient::new(aptos_client, Network::Mainnet);

    let positions = client
        .fetch_positions("0x4ed8fda291b604491ead0cc9e5232bc1edc1f31d0e0cf343be043d8c792af1a8")
        .await?;
    println!("Positions: {:?}", positions);

    Ok(())
}
