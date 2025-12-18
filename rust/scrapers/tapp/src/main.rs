mod api;
mod chain;
mod types;

use anyhow::Result;
use aptos_rust_sdk::client::builder::AptosClientBuilder;
use aptos_rust_sdk::client::config::AptosNetwork;

use chain::TappChainClient;
use db::{
    self,
    entities::{
        pools::{self, Entity as Pools},
        positions::{self, Entity as Positions},
        tokens::{self, Entity as Tokens},
    },
};
use rust_decimal::Decimal;
use scraper_common::{Scraper, run};
use sea_orm::{
    ActiveValue::Set, DatabaseConnection, EntityTrait, QueryFilter, sqlx::types::chrono::Utc,
};
use sea_orm::{ColumnTrait, sea_query::OnConflict};
use tapp::api::{api::TappHttpClient, models::PoolsQuery};
use types::Network;

use crate::{api::models::Pool, chain::convert_tick_bits_to_signed};

struct TappScraper {
    chain_client: TappChainClient,
    api_client: TappHttpClient,
    database_connection: DatabaseConnection,
}

impl Scraper for TappScraper {
    async fn scrape_pools(&self) -> anyhow::Result<()> {
        let pools = self
            .api_client
            .get_pools(PoolsQuery::all_clmm_pools())
            .await?;

        let models: Vec<pools::ActiveModel> = pools
            .into_iter()
            .map(|p| p.to_active_model().unwrap())
            .collect();

        Pools::insert_many(models)
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

    async fn scrape_pool(&self, id: &str) -> anyhow::Result<()> {
        let pool = self.api_client.get_pool(id).await?;

        let model = pool.to_active_model()?;

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
        let tokens = self
            .api_client
            .get_all_tokens()
            .await?;

        let token_models: Vec<tokens::ActiveModel> = tokens
            .iter()
            .map(|t| tokens::ActiveModel {
                id: Set(t.addr.clone()),
                name: Set(Some(t.name.clone())),
                symbol: Set(t.ticker.clone()),
                about: Set(None),
                decimals: Set(t.decimals.into()),
                logo: Set(Some(t.img.clone())),
                updated_at: Set(Some(Utc::now().naive_utc())),
            })
            .collect();

        Tokens::insert_many(token_models)
            .on_conflict_do_nothing()
            .exec_with_returning(&self.database_connection)
            .await?;

        Ok(())
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
