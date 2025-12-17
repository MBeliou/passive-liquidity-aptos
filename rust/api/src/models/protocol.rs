use serde::Serialize;
#[derive(Debug, Serialize)]
pub struct Protocol {
    pub name: String,
    pub url: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ProtocolsResponse {
    pub protocols: Vec<Protocol>,
    pub count: usize,
}