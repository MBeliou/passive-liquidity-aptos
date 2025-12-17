pub mod handlers;
pub mod jobs;
use std::sync::Arc;

use axum::{Router, routing::get};

use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/pools", get(handlers::get_pools))
        .route("/pools/{id}", get(handlers::get_pool))
        .merge(jobs::router())
}
