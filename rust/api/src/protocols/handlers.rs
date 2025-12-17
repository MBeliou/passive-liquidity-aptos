use crate::models::protocol;
use crate::{errors::AppResult, AppState};

use std::sync::Arc;
use axum::{extract::State, Json};

pub async fn list_protocols() -> AppResult<Json<protocol::ProtocolsResponse>> {
    let protocols: Vec<protocol::Protocol> = vec![protocol::Protocol {
        name: "tapp".to_string(),
        url: None
    }];

    let count = protocols.len();

    Ok(Json(protocol::ProtocolsResponse { protocols, count }))
}
