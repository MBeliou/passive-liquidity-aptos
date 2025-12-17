use db::entities::chains;
use serde::Serialize;


#[derive(Debug, Serialize)]
pub struct ChainsResponse {
    pub chains: Vec<chains::Model>,
    pub count: usize,
}
