use axum::{extract::Path};


pub async fn get_pool(Path(id): Path<String>) -> () {

} 