mod handlers;
use std::sync::Arc;
mod jobs;

use axum::{Json, Router, routing::get};

use crate::AppState;

async fn get_pools() -> Json<i32> {
    let resp = Json(1);

    resp
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/pools", get(get_pools))
        .route("/pools/{id}", get(handlers::get_pool))
        .merge(jobs::router())
}
