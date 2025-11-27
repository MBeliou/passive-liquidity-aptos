use std::sync::Arc;

use axum::{extract::State, Json};
use db::entities::pools::{Column as PoolColumn, Entity as Pools};
use sea_orm::{EntityTrait, QuerySelect};
use serde::Serialize;

use crate::{errors::AppResult, AppState};

#[derive(Debug, Serialize)]
pub struct ExchangesResponse {
    pub exchanges: Vec<String>,
    pub count: usize,
}

/// GET /exchanges - List all available exchanges/DEXes
///
/// Returns a list of exchange identifiers that have pools in the database.
/// If the database is empty, returns a hardcoded list of supported exchanges.
#[utoipa::path(
    get,
    path = "/exchanges",
    tag = "exchanges",
    responses(
        (status = 200, description = "List of exchanges")
    )
)]
pub async fn list_exchanges(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ExchangesResponse>> {
    // Query distinct dex values from pools table
    let dexes: Vec<String> = Pools::find()
        .select_only()
        .column(PoolColumn::Dex)
        .distinct()
        .into_tuple()
        .all(&state.database)
        .await?;

    // If database is empty, return hardcoded list of supported exchanges
    let exchanges = if dexes.is_empty() {
        vec!["tapp".to_string()]
    } else {
        dexes
    };

    let count = exchanges.len();

    Ok(Json(ExchangesResponse { exchanges, count }))
}
