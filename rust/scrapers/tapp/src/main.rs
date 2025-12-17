mod types;
mod api;
mod chain;

use anyhow::Result;
use aptos_rust_sdk::client::builder::AptosClientBuilder;
use aptos_rust_sdk::client::config::AptosNetwork;

use chain::TappChainClient;
use types::Network;
use scraper_common::{Scraper, run};

struct TappScraper {

}


impl Scraper for TappScraper {
    async fn scrape_pools(&self) -> anyhow::Result<()> {
        todo!("We need to deal with node usage first");
    }
    async fn scrape_pool(&self, id: &str) -> anyhow::Result<()> {
        //self.fetch_positions(pool_id);
        todo!("What do we want to do here");
    }

    async fn scrape_tokens(&self) -> anyhow::Result<()> {
        todo!("Need to get tokens within the db somehow");
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    println!("Starting Tapp scrapper.");

    let builder = AptosClientBuilder::new(AptosNetwork::mainnet());
    let aptos_client = builder.build();

    let client = TappChainClient::new(aptos_client, Network::Mainnet);

    let positions = client
        .fetch_positions("0x4ed8fda291b604491ead0cc9e5232bc1edc1f31d0e0cf343be043d8c792af1a8")
        .await?;
    println!("Positions: {:?}", positions);

    Ok(())
}
