pub mod handlers;

use std::sync::Arc;
use axum::{Router, routing::get};
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/exchanges", get(handlers::list_exchanges))
}
