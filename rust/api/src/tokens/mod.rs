pub mod handlers;

use std::sync::Arc;
use axum::{Router, routing::{get, post}};
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/tokens", get(handlers::list_tokens))
        .route("/tokens/refresh", post(handlers::refresh_tokens))
}
