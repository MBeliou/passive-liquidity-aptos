use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use sea_orm::DbErr;
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    NotFound,
    Database(DbErr),
    BadRequest(String),
    InternalServer(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "Resource not found".to_string()),
            AppError::Database(e) => {
                eprintln!("Database error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
            }
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::InternalServer(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };

        (status, Json(json!({ "error": message }))).into_response()
    }
}

// Automatically convert DbErr to AppError
impl From<DbErr> for AppError {
    fn from(err: DbErr) -> Self {
        AppError::Database(err)
    }
}

// Convert anyhow::Error to AppError
impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        AppError::InternalServer(err.to_string())
    }
}

// Type alias for convenience
pub type AppResult<T> = Result<T, AppError>;