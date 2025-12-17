mod models;
mod errors;
mod exchanges;
mod pools;
mod positions;
mod protocols;
mod tokens;
mod chains;
use axum::{
    Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::get,
};
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa_scalar::{Scalar, Servable as ScalarServable};
use utoipa::OpenApi;


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

//use crate::pools::router;

#[derive(Clone)]
struct AppState {
    //pool: PgPool,
    database: DatabaseConnection,
}

// Models
#[derive(Serialize, Deserialize)]
struct Transaction {
    hash: String,
    block_number: u64,
    dex: String,
    amount: String,
}

#[derive(Deserialize)]
struct QueryParams {
    limit: Option<u32>,
    dex: Option<String>,
}

#[derive(Deserialize)]
struct CreateTransaction {
    hash: String,
    block_number: u64,
    dex: String,
    amount: String,
}


// Routes
async fn health_check() -> &'static str {
    "OK"
}

async fn get_transactions(
    State(_state): State<Arc<AppState>>,
    Query(params): Query<QueryParams>,
) -> Json<Vec<Transaction>> {
    let limit = params.limit.unwrap_or(10);
    let _dex_filter = params.dex.unwrap_or_else(|| "all".to_string());

    // Mock data
    let txs = vec![
        Transaction {
            hash: "0x123...".to_string(),
            block_number: 18000000,
            dex: "uniswap".to_string(),
            amount: "1000000000000000000".to_string(),
        },
        Transaction {
            hash: "0x456...".to_string(),
            block_number: 18000001,
            dex: "sushiswap".to_string(),
            amount: "2000000000000000000".to_string(),
        },
    ];

    Json(txs.into_iter().take(limit as usize).collect())
}

async fn get_transaction_by_hash(
    Path(hash): Path<String>,
) -> Result<Json<Transaction>, StatusCode> {
    // Mock lookup
    if hash.starts_with("0x") {
        Ok(Json(Transaction {
            hash: hash.clone(),
            block_number: 18000000,
            dex: "uniswap".to_string(),
            amount: "1000000000000000000".to_string(),
        }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn create_transaction(
    State(_state): State<Arc<AppState>>,
    Json(payload): Json<CreateTransaction>,
) -> Result<Json<Transaction>, StatusCode> {
    // Mock creation
    Ok(Json(Transaction {
        hash: payload.hash,
        block_number: payload.block_number,
        dex: payload.dex,
        amount: payload.amount,
    }))
}

async fn get_dex_stats(Path(dex): Path<String>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "dex": dex,
        "total_volume": "1000000000000000000000",
        "transaction_count": 12345,
        "last_updated": "2025-10-23T00:00:00Z"
    }))
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
        .route(
            "/transactions",
            get(get_transactions).post(create_transaction),
        )
        .route("/transactions/{hash}", get(get_transaction_by_hash))
        .route("/dex/{name}/stats", get(get_dex_stats))
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
