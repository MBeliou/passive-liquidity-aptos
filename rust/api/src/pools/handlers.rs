use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, Query, State},
};
use db::entities::{pools, pools::Entity as Pools};
use sea_orm::{Condition, EntityTrait};

use crate::{
    AppState,
    errors::{AppError, AppResult},
};
use sea_orm::ColumnTrait;
use sea_orm::QueryFilter;
use sea_orm::QueryOrder;
use sea_orm::QuerySelect;

#[axum::debug_handler]
pub async fn get_pool(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> AppResult<Json<pools::Model>> {
    let pool = Pools::find_by_id(id)
        .one(&state.database)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(pool))
}

#[derive(Debug, Deserialize)]
pub struct PoolsQuery {
    // Token filter - matches if token is in tokenA OR tokenB
    pub token: Option<String>,

    // Fee filters
    pub fee: Option<Decimal>,
    pub fee_min: Option<Decimal>,
    pub fee_max: Option<Decimal>,

    // Volume filters (using day volume as default)
    pub volume_min: Option<f64>,
    pub volume_max: Option<f64>,
    pub volume_period: Option<VolumePeriod>,

    // TVL filters
    pub tvl_min: Option<f64>,
    pub tvl_max: Option<f64>,

    // APR filters
    pub apr_min: Option<f64>,
    pub apr_max: Option<f64>,
    pub apr_type: Option<AprType>,

    // Ordering
    pub order_by: Option<OrderBy>,
    pub order_dir: Option<OrderDir>,

    // Pagination
    pub limit: Option<u64>,
    pub offset: Option<u64>,
}

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum VolumePeriod {
    Day,
    Week,
    Month,
    PrevDay,
}

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum AprType {
    Bonus,
    Trading,
    Total, // bonus + trading
}

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum OrderBy {
    Fee,
    VolumeDay,
    VolumeWeek,
    VolumeMonth,
    BonusApr,
    TradingApr,
    TotalApr,
    Tvl,
    UpdatedAt,
}

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum OrderDir {
    Asc,
    Desc,
}

// Response struct
#[derive(Serialize)]
pub struct PoolsResponse {
    pub pools: Vec<pools::Model>,
    pub count: usize,
}

/*
#[axum::debug_handler]
pub async fn get_pools(State(state): State<Arc<AppState>>) -> AppResult<Json<Vec<pools::Model>>> {
    let pools = Pools::find()
        .all(&state.database)
        .await?;
        //.ok_or(AppError::InternalServer);
    Ok(Json(pools))
}
 */
#[axum::debug_handler]
pub async fn get_pools(
    State(state): State<Arc<AppState>>,
    Query(params): Query<PoolsQuery>,
) -> AppResult<Json<PoolsResponse>> {
    let mut query = Pools::find();

    // Store these before they're moved
    let order_by = params.order_by.clone();
    let order_dir = params.order_dir.clone().unwrap_or(OrderDir::Desc);
    let apr_type = params.apr_type.clone().unwrap_or(AprType::Total);

    // Apply filters
    let mut condition = Condition::all();

    // Token filter - check both tokenA and tokenB
    if let Some(token) = params.token {
        condition = condition.add(
            Condition::any()
                .add(pools::Column::TokenA.eq(token.clone()))
                .add(pools::Column::TokenB.eq(token)),
        );
    }

    // Fee filters
    if let Some(fee) = params.fee {
        condition = condition.add(pools::Column::Fee.eq(fee));
    }
    if let Some(fee_min) = params.fee_min {
        condition = condition.add(pools::Column::Fee.gte(fee_min));
    }
    if let Some(fee_max) = params.fee_max {
        condition = condition.add(pools::Column::Fee.lte(fee_max));
    }

    // Volume filters
    let volume_column = match params.volume_period.as_ref().unwrap_or(&VolumePeriod::Day) {
        VolumePeriod::Day => pools::Column::VolumeDay,
        VolumePeriod::Week => pools::Column::VolumeWeek,
        VolumePeriod::Month => pools::Column::VolumeMonth,
        VolumePeriod::PrevDay => pools::Column::VolumePrevDay,
    };

    if let Some(vol_min) = params.volume_min {
        condition = condition.add(volume_column.gte(vol_min));
    }
    if let Some(vol_max) = params.volume_max {
        condition = condition.add(volume_column.lte(vol_max));
    }

    // TVL filters
    if let Some(tvl_min) = params.tvl_min {
        condition = condition.add(pools::Column::Tvl.gte(tvl_min));
    }
    if let Some(tvl_max) = params.tvl_max {
        condition = condition.add(pools::Column::Tvl.lte(tvl_max));
    }

    // APR filters
    match &apr_type {
        AprType::Bonus => {
            if let Some(apr_min) = params.apr_min {
                condition = condition.add(pools::Column::BonusApr.gte(apr_min));
            }
            if let Some(apr_max) = params.apr_max {
                condition = condition.add(pools::Column::BonusApr.lte(apr_max));
            }
        }
        AprType::Trading => {
            if let Some(apr_min) = params.apr_min {
                condition = condition.add(pools::Column::TradingApr.gte(apr_min));
            }
            if let Some(apr_max) = params.apr_max {
                condition = condition.add(pools::Column::TradingApr.lte(apr_max));
            }
        }
        AprType::Total => {
            // For total APR, we'll filter after fetching
            // since it's a computed value (bonus_apr + trading_apr)
        }
    }

    query = query.filter(condition);

    // Apply ordering
    if let Some(order_by_val) = &order_by {
        query = match order_by_val {
            OrderBy::Fee => match order_dir {
                OrderDir::Asc => query.order_by_asc(pools::Column::Fee),
                OrderDir::Desc => query.order_by_desc(pools::Column::Fee),
            },
            OrderBy::VolumeDay => match order_dir {
                OrderDir::Asc => query.order_by_asc(pools::Column::VolumeDay),
                OrderDir::Desc => query.order_by_desc(pools::Column::VolumeDay),
            },
            OrderBy::VolumeWeek => match order_dir {
                OrderDir::Asc => query.order_by_asc(pools::Column::VolumeWeek),
                OrderDir::Desc => query.order_by_desc(pools::Column::VolumeWeek),
            },
            OrderBy::VolumeMonth => match order_dir {
                OrderDir::Asc => query.order_by_asc(pools::Column::VolumeMonth),
                OrderDir::Desc => query.order_by_desc(pools::Column::VolumeMonth),
            },
            OrderBy::BonusApr => match order_dir {
                OrderDir::Asc => query.order_by_asc(pools::Column::BonusApr),
                OrderDir::Desc => query.order_by_desc(pools::Column::BonusApr),
            },
            OrderBy::TradingApr => match order_dir {
                OrderDir::Asc => query.order_by_asc(pools::Column::TradingApr),
                OrderDir::Desc => query.order_by_desc(pools::Column::TradingApr),
            },
            OrderBy::TotalApr => {
                // For total APR sorting, we'll sort after fetching
                // Default to bonus_apr in the query
                match order_dir {
                    OrderDir::Asc => query.order_by_asc(pools::Column::BonusApr),
                    OrderDir::Desc => query.order_by_desc(pools::Column::BonusApr),
                }
            }
            OrderBy::Tvl => match order_dir {
                OrderDir::Asc => query.order_by_asc(pools::Column::Tvl),
                OrderDir::Desc => query.order_by_desc(pools::Column::Tvl),
            },
            OrderBy::UpdatedAt => match order_dir {
                OrderDir::Asc => query.order_by_asc(pools::Column::UpdatedAt),
                OrderDir::Desc => query.order_by_desc(pools::Column::UpdatedAt),
            },
        };
    } else {
        // Default ordering by TVL descending
        query = query.order_by_desc(pools::Column::Tvl);
    }

    // Apply pagination
    if let Some(limit) = params.limit {
        query = query.limit(limit);
    }
    if let Some(offset) = params.offset {
        query = query.offset(offset);
    }

    // Execute query
    let mut pools = query.all(&state.database).await?;

    // Post-fetch filtering for total APR if needed
    if matches!(apr_type, AprType::Total) {
        if let Some(apr_min) = params.apr_min {
            pools.retain(|p| p.bonus_apr + p.trading_apr >= apr_min);
        }
        if let Some(apr_max) = params.apr_max {
            pools.retain(|p| p.bonus_apr + p.trading_apr <= apr_max);
        }

        // Re-sort if ordering by total APR
        if matches!(order_by, Some(OrderBy::TotalApr)) {
            pools.sort_by(|a, b| {
                let total_a = a.bonus_apr + a.trading_apr;
                let total_b = b.bonus_apr + b.trading_apr;
                match order_dir {
                    OrderDir::Asc => total_a.partial_cmp(&total_b).unwrap(),
                    OrderDir::Desc => total_b.partial_cmp(&total_a).unwrap(),
                }
            });
        }
    }

    let count = pools.len();

    Ok(Json(PoolsResponse { pools, count }))
}
