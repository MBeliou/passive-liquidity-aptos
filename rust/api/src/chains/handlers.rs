use crate::{errors::AppResult, models::chain};
use axum::{Json, extract::State};

pub async fn list_chains() -> AppResult<Json<chain::ChainsResponse>> {
    // TODO: stub
    let chains = vec![chain::Chain {
        name: "Aptos".to_string(),
        id: "aptos".to_string(),
    }];

    let count = 1;

    Ok(Json(chain::ChainsResponse { chains, count }))
}

pub async fn get_chain(id: String) -> AppResult<Json<chain::Chain>> {
    // TODO: stub
    Ok(Json(chain::Chain {
        name: "Aptos".to_string(),
        id: "aptos".to_string(),
    }))
}
