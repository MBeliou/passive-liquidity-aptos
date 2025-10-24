pub mod handlers;

use std::sync::Arc;
use crate::AppState;
use axum::{
    extract::{Path, State}, http::StatusCode, routing::{get, post}, Json, Router
};

pub async fn refresh_pool(State(state): State<Arc<AppState>>, Path(id): Path<String>) -> Result<Json<Vec<tapp::types::Position>>, StatusCode> {
    let tapp_client = tapp::TappClient::from_network(tapp::types::Network::Mainnet);

    // TODO: Get Pool info

    // TODO: get pool positions
    let positions = tapp_client.fetch_positions(&id).await;

    // TODO: link to database
    match positions {
        Ok(value) => Ok(Json(value)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR)
     }

    
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/refresh/pool/{id}", post(refresh_pool))
}
