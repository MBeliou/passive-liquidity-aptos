mod api;
mod chain;
mod types;

use anyhow::Result;
use aptos_rust_sdk::client::builder::AptosClientBuilder;
use aptos_rust_sdk::client::config::AptosNetwork;

use chain::TappChainClient;
use db::{
    self,
    entities::pools::{self, Entity as Pools},
    entities::positions::{self, Entity as Positions},
};
use rust_decimal::Decimal;
use scraper_common::{Scraper, run};
use sea_orm::{
    ActiveValue::Set, DatabaseConnection, EntityTrait, QueryFilter, sqlx::types::chrono::Utc,
};
use sea_orm::{ColumnTrait, sea_query::OnConflict};
use tapp::api::api::TappHttpClient;
use types::Network;

use crate::chain::convert_tick_bits_to_signed;

struct TappScraper {
    chain_client: TappChainClient,
    api_client: TappHttpClient,
    database_connection: DatabaseConnection,
}

impl Scraper for TappScraper {
    async fn scrape_pools(&self) -> anyhow::Result<()> {
        todo!("Implement scrape pools");
    }

    async fn scrape_pool(&self, id: &str) -> anyhow::Result<()> {
        let pool = self.api_client.get_pool(id).await?;

        let mut tokens = pool.tokens;
        let token_b = tokens.pop().map(|t| t.addr);
        let token_a = tokens.pop().map(|t| t.addr);

        let model = pools::ActiveModel {
            // Note: Position index is mostly unused now that contract queries are fixed
            position_index: Set(None),
            id: Set(id.to_string()),
            dex: Set("tapp".to_string()),
            fee: Set(pool.fee_tier.parse::<Decimal>()?),
            trading_apr: Set(pool.apr.fee_apr_percentage as f64),
            bonus_apr: Set(pool.apr.boosted_apr_percentage as f64),
            tvl: Set(pool.tvl.parse::<f64>()?),
            volume_day: Set(pool.volume_data.volume24h as f64),
            volume_week: Set(pool.volume_data.volume7d as f64),
            volume_month: Set(pool.volume_data.volume30d as f64),
            volume_prev_day: Set(pool.volume_data.volumeprev24h as f64),
            token_a: Set(token_a),
            token_b: Set(token_b),
            updated_at: Set(Some(Utc::now().naive_utc())),
        };
        Pools::insert(model)
            .on_conflict(
                OnConflict::column(pools::Column::Id)
                    .update_columns([
                        pools::Column::TradingApr,
                        pools::Column::BonusApr,
                        pools::Column::Tvl,
                        pools::Column::VolumeDay,
                        pools::Column::VolumeWeek,
                        pools::Column::VolumeMonth,
                        pools::Column::VolumePrevDay,
                        pools::Column::UpdatedAt,
                    ])
                    .to_owned(),
            )
            .exec(&self.database_connection)
            .await?;

        Ok(())
    }

    async fn scrape_positions(&self, id: &str) -> anyhow::Result<()> {
        let positions = self.chain_client.fetch_positions(id).await?;
        let position_ids: Vec<i32> = positions
            .iter()
            .map(|p| p.index.clone().parse::<i32>().unwrap())
            .collect();

        let models: Vec<positions::ActiveModel> = positions
            .into_iter()
            .map(|p| {
                let tick_lower_bits = p.tick_lower_index.bits.parse::<u64>().unwrap();
                let tick_upper_bits = p.tick_upper_index.bits.parse::<u64>().unwrap();

                let position_index = p.index.parse::<i32>().unwrap();

                positions::ActiveModel {
                    pool: Set(id.to_string()),
                    index: Set(position_index),
                    tick_lower: Set(convert_tick_bits_to_signed(tick_lower_bits)),
                    tick_upper: Set(convert_tick_bits_to_signed(tick_upper_bits)),
                    liquidity: Set(p.liquidity),
                    updated_at: Set(Some(Utc::now().naive_utc())),
                    ..Default::default()
                }
            })
            .collect();

        if !models.is_empty() {
            Positions::insert_many(models)
                .on_conflict(
                    sea_orm::sea_query::OnConflict::columns([
                        positions::Column::Pool,
                        positions::Column::Index,
                    ])
                    .update_columns([positions::Column::Liquidity])
                    .to_owned(),
                )
                .exec(&self.database_connection)
                .await?;
        }

        Positions::delete_many()
            .filter(positions::Column::Pool.eq(id))
            .filter(positions::Column::Index.is_not_in(position_ids))
            .exec(&self.database_connection)
            .await?;
        Ok(())
    }

    async fn scrape_tokens(&self) -> anyhow::Result<()> {
        todo!("Need to get tokens within the db somehow");
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    println!("Starting Tapp scrapper.");

    let connection = db::create_connection(
        "postgresql://root:mysecretpassword@localhost:5432/passive_liquidity_db",
    )
    .await?;

    let builder = AptosClientBuilder::new(AptosNetwork::mainnet());
    let aptos_client = builder.build();
    let chain_client = TappChainClient::new(aptos_client, Network::Mainnet);

    let api_client = TappHttpClient::new();
    let scraper = TappScraper {
        chain_client,
        api_client,
        database_connection: connection,
    };
    run(scraper).await;

    Ok(())
}
