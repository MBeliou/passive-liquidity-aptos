mod handlers;

use crate::AppState;
use axum::{Router, routing::get};
use std::sync::Arc;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/chains", get(handlers::get_chains))
        .route("/chains/{id}", get(handlers::get_chain))
}
