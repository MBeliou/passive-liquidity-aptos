use std::sync::Arc;

use axum::{extract::{Path, State}, Json};
use db::entities::{pools, positions};
use hyperion::{HyperionGraphQLClient, types::Network};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use serde::Serialize;

use crate::{errors::AppResult, AppState};

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct RefreshPoolsResponse {
    pub status: String,
    pub message: String,
    pub pools_updated: usize,
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct RefreshPositionsResponse {
    pub status: String,
    pub message: String,
    pub positions_updated: usize,
}

/// POST /hyperion/pools/refresh - Refresh all pools from Hyperion
///
/// Fetches pool data from Hyperion's GraphQL API and updates the database
#[utoipa::path(
    post,
    path = "/hyperion/pools/refresh",
    tag = "hyperion",
    responses(
        (status = 200, description = "Pools refreshed successfully", body = RefreshPoolsResponse)
    )
)]
pub async fn refresh_pools(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<RefreshPoolsResponse>> {
    let graphql_client = HyperionGraphQLClient::new(Network::Mainnet);

    // Fetch all pools from Hyperion GraphQL API
    let pools_data = graphql_client.fetch_all_pools().await?;

    let mut pools_updated = 0;

    for pool_data in pools_data {
        // Parse fee tier to decimal
        let fee = pool_data.fee_tier.parse::<rust_decimal::Decimal>()
            .unwrap_or_else(|_| rust_decimal::Decimal::ZERO);

        let pool_model = pools::ActiveModel {
            id: Set(pool_data.pool_id.clone()),
            token_a: Set(Some(pool_data.token_a.clone())),
            token_b: Set(Some(pool_data.token_b.clone())),
            fee: Set(fee),
            dex: Set("hyperion".to_string()),
            position_index: Set(None),
            trading_apr: Set(pool_data.apr.unwrap_or(0.0)),
            bonus_apr: Set(0.0), // Hyperion may not separate bonus APR
            tvl: Set(pool_data.tvl.unwrap_or(0.0)),
            volume_day: Set(pool_data.volume_24h.unwrap_or(0.0)),
            volume_week: Set(0.0), // May need additional query
            volume_month: Set(0.0), // May need additional query
            volume_prev_day: Set(0.0), // May need additional query
            updated_at: Set(Some(chrono::Utc::now().naive_utc())),
        };

        // Upsert pool (insert or update)
        match pool_model.insert(&state.database).await {
            Ok(_) => {},
            Err(_) => {
                // If insert fails (already exists), update instead
                pools::ActiveModel {
                    id: Set(pool_data.pool_id.clone()),
                    token_a: Set(Some(pool_data.token_a.clone())),
                    token_b: Set(Some(pool_data.token_b.clone())),
                    fee: Set(fee),
                    dex: Set("hyperion".to_string()),
                    trading_apr: Set(pool_data.apr.unwrap_or(0.0)),
                    bonus_apr: Set(0.0),
                    tvl: Set(pool_data.tvl.unwrap_or(0.0)),
                    volume_day: Set(pool_data.volume_24h.unwrap_or(0.0)),
                    volume_week: Set(0.0),
                    volume_month: Set(0.0),
                    volume_prev_day: Set(0.0),
                    updated_at: Set(Some(chrono::Utc::now().naive_utc())),
                    ..Default::default()
                }
                .update(&state.database)
                .await?;
            }
        }

        pools_updated += 1;
    }

    Ok(Json(RefreshPoolsResponse {
        status: "success".to_string(),
        message: format!("Refreshed {} Hyperion pools", pools_updated),
        pools_updated,
    }))
}

/// POST /hyperion/positions/refresh/:pool_id - Refresh positions for a Hyperion pool
///
/// Fetches position data from Hyperion's GraphQL API and updates the database
#[utoipa::path(
    post,
    path = "/hyperion/positions/refresh/{pool_id}",
    tag = "hyperion",
    params(
        ("pool_id" = String, Path, description = "Pool ID")
    ),
    responses(
        (status = 200, description = "Positions refreshed successfully", body = RefreshPositionsResponse)
    )
)]
pub async fn refresh_positions(
    State(state): State<Arc<AppState>>,
    Path(pool_id): Path<String>,
) -> AppResult<Json<RefreshPositionsResponse>> {
    let graphql_client = HyperionGraphQLClient::new(Network::Mainnet);

    // Fetch all positions for this pool
    let positions_data = graphql_client.fetch_positions_by_pool(&pool_id).await?;

    let mut positions_updated = 0;

    for position_data in positions_data {
        let position_model = positions::ActiveModel {
            index: Set(position_data.position_id.parse::<i32>().unwrap_or(0)),
            pool: Set(pool_id.clone()),
            tick_lower: Set(position_data.tick_lower as i64),
            tick_upper: Set(position_data.tick_upper as i64),
            liquidity: Set(position_data.liquidity.clone()),
            updated_at: Set(Some(chrono::Utc::now().naive_utc())),
        };

        // Upsert position
        match position_model.insert(&state.database).await {
            Ok(_) => {},
            Err(_) => {
                // If insert fails (already exists), update instead
                positions::ActiveModel {
                    index: Set(position_data.position_id.parse::<i32>().unwrap_or(0)),
                    pool: Set(pool_id.clone()),
                    tick_lower: Set(position_data.tick_lower as i64),
                    tick_upper: Set(position_data.tick_upper as i64),
                    liquidity: Set(position_data.liquidity.clone()),
                    updated_at: Set(Some(chrono::Utc::now().naive_utc())),
                }
                .update(&state.database)
                .await?;
            }
        }

        positions_updated += 1;
    }

    Ok(Json(RefreshPositionsResponse {
        status: "success".to_string(),
        message: format!("Refreshed {} positions for pool {}", positions_updated, pool_id),
        positions_updated,
    }))
}
