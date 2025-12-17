pub mod handlers;

use std::sync::Arc;
use axum::{Router, routing::post};
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/positions/refresh/{pool_id}", post(handlers::refresh_positions))
}
