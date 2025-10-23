use aptos_rust_sdk::client::builder::AptosClientBuilder;
use aptos_rust_sdk::client::config::AptosNetwork;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()>{
    println!("Starting Tapp scrapper.");
    let builder = AptosClientBuilder::new(AptosNetwork::mainnet());
    let client = builder.build();

    //AptosClientBuilder::ne
    
    let state = client.get_state().await?;

    println!("State: {:?}", state);

    Ok(())
}
