use std::sync::Arc;

use axum::{extract::State, Json};
use db::entities::{tokens, tokens::Entity as Tokens};
use sea_orm::{ActiveModelTrait, EntityTrait, QueryOrder, QuerySelect, Set};
use serde::{Deserialize, Serialize};
use tapp::api::{api::TappHttpClient};
use tapp::api::models::TokenListQuery;
use crate::{
    errors::{AppError, AppResult},
    AppState,
};

#[derive(Debug, Serialize)]
pub struct TokensResponse {
    pub tokens: Vec<tokens::Model>,
    pub count: usize,
}

#[derive(Debug, Deserialize)]
pub struct TokensQuery {
    pub limit: Option<u64>,
    pub offset: Option<u64>,
}

/// GET /tokens - List all tokens
#[utoipa::path(
    get,
    path = "/tokens",
    tag = "tokens",
    responses(
        (status = 200, description = "List of tokens")
    )
)]
pub async fn list_tokens(
    State(state): State<Arc<AppState>>,
    axum::extract::Query(params): axum::extract::Query<TokensQuery>,
) -> AppResult<Json<TokensResponse>> {
    let mut query = Tokens::find().order_by_asc(tokens::Column::Symbol);

    if let Some(limit) = params.limit {
        query = query.limit(limit);
    }
    if let Some(offset) = params.offset {
        query = query.offset(offset);
    }

    let tokens = query.all(&state.database).await?;
    let count = tokens.len();

    Ok(Json(TokensResponse { tokens, count }))
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct RefreshResponse {
    pub status: String,
    pub message: String,
    pub tokens_updated: usize,
}

/// POST /tokens/refresh - Refresh token list from TAPP API
#[utoipa::path(
    post,
    path = "/tokens/refresh",
    tag = "tokens",
    responses(
        (status = 200, description = "Tokens refreshed successfully", body = RefreshResponse)
    )
)]
pub async fn refresh_tokens(State(state): State<Arc<AppState>>) -> AppResult<Json<RefreshResponse>> {
    let http_client = TappHttpClient::new();

    // Fetch tokens from TAPP API
    // Note: API has a limit of 30 per page, but we'll fetch 100 to cover current token count
    let query = TokenListQuery {
        start_time: None,
        end_time: None,
        keyword: None,
        page: Some(1),
        page_size: Some(100),
    };

    let api_tokens = http_client
        .get_token_list(query)
        .await
        .map_err(|e| AppError::InternalServer(format!("Failed to fetch tokens from TAPP API: {}", e)))?;

    // Upsert tokens to database
    let mut tokens_updated = 0;

    for token in &api_tokens {
        let token_model = tokens::ActiveModel {
            id: Set(token.addr.clone()),
            symbol: Set(token.ticker.clone()),
            name: Set(Some(token.name.clone())),
            about: Set(None),
            logo: Set(Some(token.img.clone())),
            decimals: Set(token.decimals as i32),
            updated_at: Set(Some(chrono::Utc::now().naive_utc())),
        };

        // Insert or update
        match Tokens::find_by_id(&token.addr).one(&state.database).await? {
            Some(existing) => {
                // Update existing token
                let mut existing: tokens::ActiveModel = existing.into();
                existing.symbol = Set(token.ticker.clone());
                existing.name = Set(Some(token.name.clone()));
                existing.logo = Set(Some(token.img.clone()));
                existing.decimals = Set(token.decimals as i32);
                existing.updated_at = Set(Some(chrono::Utc::now().naive_utc()));
                existing.update(&state.database).await?;
            }
            None => {
                // Insert new token
                token_model.insert(&state.database).await?;
            }
        }

        tokens_updated += 1;
    }

    Ok(Json(RefreshResponse {
        status: "success".to_string(),
        message: format!("Updated {} tokens", tokens_updated),
        tokens_updated,
    }))
}
