use serde::Serialize;

// Stub for now, we'll do with an ID and name until we need the rest of the info
#[derive(Debug, Serialize)]
pub struct Chain {
    id: String,
    name: String,
}
