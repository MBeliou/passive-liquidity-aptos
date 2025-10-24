pub mod entities;

use sea_orm::{Database, DatabaseConnection};

pub async fn create_connection(database_url: &str) -> Result<DatabaseConnection, sea_orm::DbErr> {
    Database::connect(database_url).await
}
