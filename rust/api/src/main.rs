mod pools;
use axum::{
    Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

//use crate::pools::router;

#[derive(Clone)]
struct AppState {
    // pool: PgPool,
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
    let dex_filter = params.dex.unwrap_or_else(|| "all".to_string());

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
async fn main() {
    let state = Arc::new(AppState {});

    let app = Router::new()
        .route("/health", get(health_check))
        .route(
            "/transactions",
            get(get_transactions).post(create_transaction),
        )
        .route("/transactions/{hash}", get(get_transaction_by_hash))
        .route("/dex/{name}/stats", get(get_dex_stats))
        .merge(pools::router())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("🚀 Server running on http://127.0.0.1:3000");

    axum::serve(listener, app).await.unwrap();
}
