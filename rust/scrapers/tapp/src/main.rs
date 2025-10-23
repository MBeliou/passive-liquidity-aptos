mod types;

use anyhow::Result;
use aptos_rust_sdk::client::builder::AptosClientBuilder;
use aptos_rust_sdk::client::config::AptosNetwork;
use aptos_rust_sdk_types::api_types::view::ViewRequest;
use serde_json::Value;

use types::Position;

#[tokio::main]
async fn main() -> Result<()> {
    println!("Starting Tapp scrapper.");
    let builder = AptosClientBuilder::new(AptosNetwork::mainnet());
    let client = builder.build();

    let view_address = "0xf5840b576a3a6a42464814bc32ae1160c50456fb885c62be389b817e75b2a385";

    let state = client.get_state().await?;

    println!("State: {:?}", state);

    let query = client
        .view_function(ViewRequest {
            arguments: vec![
                Value::String(
                    "0x4ed8fda291b604491ead0cc9e5232bc1edc1f31d0e0cf343be043d8c792af1a8"
                        .to_string(), //"0x8f9dd0b94f1c18f96c00dfbff8254f20304f05713bb841d20b203f9446a75b9".to_string(),
                ),
                //Value::Number(10.into()),
            ],
            function: format!("{}::clmm_views::get_positions", view_address),
            type_arguments: vec![],
        })
        .await?;
    
    let response = query.into_inner();
    // First, print to see the structure
println!("Raw response: {}", serde_json::to_string_pretty(&response)?);


let positions: Vec<Position> = serde_json::from_value(response[0].clone())?;

    println!("Positions: {:?}", positions);

    Ok(())
}
