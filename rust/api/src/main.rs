mod chains;
mod errors;
mod exchanges;
mod models;
mod pools;
mod positions;
mod protocols;
mod tokens;
use axum::{Router, routing::get};
use sea_orm::DatabaseConnection;
use std::sync::Arc;
use utoipa::OpenApi;
use utoipa_scalar::{Scalar, Servable as ScalarServable};

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
        positions::handlers::refresh_positions
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

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let connection = db::create_connection(
        "postgresql://root:mysecretpassword@localhost:5432/passive_liquidity_db",
    )
    .await?;
    let state = Arc::new(AppState {
        database: connection,
    });

    let app = Router::new()
        .route("/health", get(health_check))
        .merge(protocols::router())
        .merge(exchanges::router())
        .merge(pools::router())
        .merge(tokens::router())
        .merge(chains::router())
        .merge(positions::router())
        .merge(Scalar::with_url("/scalar", ApiDoc::openapi()))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("🚀 Server running on http://127.0.0.1:3000");

    axum::serve(listener, app).await.unwrap();

    Ok(())
}
