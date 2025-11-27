pub mod handlers;

use std::sync::Arc;
use crate::AppState;
use axum::{
    routing::post, Router
};

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/pools/refresh", post(handlers::refresh_pools))
        .route("/pools/{id}/refresh", post(handlers::refresh_single_pool))
}
