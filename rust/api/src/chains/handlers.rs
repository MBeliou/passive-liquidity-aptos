use crate::{errors::AppResult, models::chain};
use axum::{Json, extract::State};

pub async fn list_chains() -> AppResult<Json<chain::ChainsResponse>> {
    let chains = vec![chain::Chain {
        name: "Aptos".to_string(),
        id: "aptos".to_string(),
    }];

    let count = 1;

    Ok(Json(chain::ChainsResponse { chains, count }))
}
