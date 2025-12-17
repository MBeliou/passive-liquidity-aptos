use db::entities::chains;
use serde::Serialize;

// Stub for now, we'll do with an ID and name until we need the rest of the info
#[derive(Debug, Serialize)]
pub struct Chain {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize)]
pub struct ChainsResponse {
    pub chains: Vec<chains::Model>,
    pub count: usize,
}
