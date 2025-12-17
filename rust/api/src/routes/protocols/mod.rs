mod handlers;

use std::sync::Arc;
use axum::{Router, routing::get};
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/protocols", get(handlers::list_protocols))
}
