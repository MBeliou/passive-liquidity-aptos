mod handlers;
use std::sync::Arc;
mod jobs;

use axum::{Json, Router, routing::get};

use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/pools", get(handlers::get_pools))
        .route("/pools/{id}", get(handlers::get_pool))
        .merge(jobs::router())
}
