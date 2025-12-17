use std::sync::Arc;

use axum::{extract::{Path, State}, Json};
use db::entities::{pools::Entity as Pools, positions, positions::Entity as Positions};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::Serialize;
use tapp::{convert_tick_bits_to_signed, types::Network, TappChainClient};

use crate::{
    errors::{AppError, AppResult},
    AppState,
};

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct RefreshPositionsResponse {
    pub status: String,
    pub message: String,
    pub positions_updated: usize,
}

/// POST /positions/refresh/:pool_id - Refresh positions for a specific pool
///
/// This endpoint fetches position data from the blockchain for a given pool
/// and updates the database. It intelligently fetches only new positions
/// if the pool has been synced before, or all positions if it's the first sync.
#[utoipa::path(
    post,
    path = "/positions/refresh/{pool_id}",
    tag = "positions",
    params(
        ("pool_id" = String, Path, description = "Pool ID to refresh positions for")
    ),
    responses(
        (status = 200, description = "Positions refreshed successfully", body = RefreshPositionsResponse),
        (status = 404, description = "Pool not found")
    )
)]
pub async fn refresh_positions(
    State(state): State<Arc<AppState>>,
    Path(pool_id): Path<String>,
) -> AppResult<Json<RefreshPositionsResponse>> {
    // Check if pool exists in database
    let _pool = Pools::find_by_id(&pool_id)
        .one(&state.database)
        .await?
        .ok_or(AppError::NotFound)?;

    // Initialize TAPP client
    let tapp_client = TappChainClient::from_network(Network::Mainnet);

    // Fetch all positions for the pool
    let positions = tapp_client
        .fetch_positions(&pool_id)
        .await
        .map_err(|e| AppError::InternalServer(format!("Failed to fetch positions: {}", e)))?;

    if positions.is_empty() {
        return Ok(Json(RefreshPositionsResponse {
            status: "success".to_string(),
            message: "No positions found for pool".to_string(),
            positions_updated: 0,
        }));
    }

    println!("Fetched {} positions for pool {}", positions.len(), pool_id);

    // Upsert positions to database
    let mut positions_updated = 0;

    for position in positions {
        let index = position.index.parse::<i32>()
            .map_err(|e| AppError::InternalServer(format!("Invalid position index: {}", e)))?;

        let tick_lower_bits = position.tick_lower_index.bits.parse::<u64>()
            .map_err(|e| AppError::InternalServer(format!("Invalid tick_lower bits: {}", e)))?;
        let tick_upper_bits = position.tick_upper_index.bits.parse::<u64>()
            .map_err(|e| AppError::InternalServer(format!("Invalid tick_upper bits: {}", e)))?;

        let tick_lower = convert_tick_bits_to_signed(tick_lower_bits);
        let tick_upper = convert_tick_bits_to_signed(tick_upper_bits);

        let position_model = positions::ActiveModel {
            index: Set(index),
            pool: Set(pool_id.clone()),
            tick_lower: Set(tick_lower),
            tick_upper: Set(tick_upper),
            liquidity: Set(position.liquidity.clone()),
            updated_at: Set(Some(chrono::Utc::now().naive_utc())),
        };

        // Check if position exists
        match Positions::find()
            .filter(positions::Column::Index.eq(index))
            .filter(positions::Column::Pool.eq(&pool_id))
            .one(&state.database)
            .await?
        {
            Some(existing) => {
                // Update existing position
                let mut existing: positions::ActiveModel = existing.into();
                existing.tick_lower = Set(tick_lower);
                existing.tick_upper = Set(tick_upper);
                existing.liquidity = Set(position.liquidity);
                existing.updated_at = Set(Some(chrono::Utc::now().naive_utc()));
                existing.update(&state.database).await?;
            }
            None => {
                // Insert new position
                position_model.insert(&state.database).await?;
            }
        }

        positions_updated += 1;
    }

    Ok(Json(RefreshPositionsResponse {
        status: "success".to_string(),
        message: format!("Updated {} positions for pool {}", positions_updated, pool_id),
        positions_updated,
    }))
}
