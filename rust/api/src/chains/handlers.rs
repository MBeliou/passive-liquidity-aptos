use crate::{
    AppState,
    errors::{AppError, AppResult},
    models::chain,
};
use axum::{Json, extract::State};
use db::entities::{chains, chains::Entity as Chains};
use sea_orm::{EntityTrait};
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

#[utoipa::path(get, path = "/chain/{id}", tag = "chains")]
#[axum::debug_handler]
pub async fn get_chain(
    State(state): State<Arc<AppState>>,
    id: String,
) -> AppResult<Json<chains::Model>> {
    let query = Chains::find_by_id(id);
    let chain = query
        .one(&state.database)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(chain))
}
