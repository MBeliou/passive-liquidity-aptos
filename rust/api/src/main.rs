mod errors;
mod models;
mod routes;
use axum::{Json, Router, response::IntoResponse, routing::get};
use sea_orm::DatabaseConnection;
use std::sync::Arc;
use utoipa::OpenApi;
use utoipa_scalar::{Scalar, Servable as ScalarServable};

use routes::*;

/* OpenAPI */
#[derive(OpenApi)]
#[openapi(
    paths(
        exchanges::handlers::list_exchanges,
        pools::handlers::get_pools,
        pools::handlers::get_pool,
        pools::jobs::handlers::refresh_pools,
        pools::jobs::handlers::refresh_single_pool,
        tokens::handlers::list_tokens,
        tokens::handlers::refresh_tokens,
        positions::handlers::refresh_positions,
        chains::handlers::get_chains,
        chains::handlers::get_chain
    ),
    components()
)]
struct ApiDoc;

#[derive(Clone)]
struct AppState {
    database: DatabaseConnection,
}

// Routes
async fn health_check() -> &'static str {
    "OK"
}


async fn openapi_json() -> impl IntoResponse {
    Json(ApiDoc::openapi())
}


#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let connection = db::create_connection(
        "postgresql://root:mysecretpassword@localhost:5432/passive_liquidity_db",
    )
    .await?;
    let state = Arc::new(AppState {
        database: connection,
    });

    let v1 = Router::new()
        .merge(protocols::router())
        .merge(exchanges::router())
        .merge(pools::router())
        .merge(tokens::router())
        .merge(chains::router())
        .merge(positions::router());

    let app = Router::new()
        .route("/health", get(health_check))
        .nest("/v1", v1)
        .merge(Scalar::with_url("/scalar", ApiDoc::openapi()))
        .route("/openapi.json", get(openapi_json))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("🚀 Server running on http://127.0.0.1:3000");

    axum::serve(listener, app).await.unwrap();

    Ok(())
}
