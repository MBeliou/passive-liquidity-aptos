use crate::{AppState, errors::AppResult, models::chain};
use axum::{Json, extract::State};
use db::entities::{chains, chains::Entity as Chains};
use sea_orm::{Condition, EntityTrait};
use std::sync::Arc;

// NOTE: not enough chains to worry about pagination. Not dealing with filtering for now either.
#[utoipa::path(get, path = "/chains", tag = "chains")]
#[axum::debug_handler]
pub async fn get_chains(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<chain::ChainsResponse>> {
    let mut query = Chains::find();
    query = query.order_by_id_desc();

    let chains = query.all(&state.database).await?;
    let count = chains.len();

    Ok(Json(chain::ChainsResponse { chains, count }))
}

pub async fn get_chain(id: String) -> AppResult<Json<chain::Chain>> {
    // TODO: stub
    Ok(Json(chain::Chain {
        name: "Aptos".to_string(),
        id: "aptos".to_string(),
    }))
}
