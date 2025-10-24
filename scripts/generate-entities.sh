#!/bin/bash

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo ".env file not found"
    exit 1
fi

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

sea-orm-cli generate entity \
    --database-url "$DATABASE_URL" \
    --with-serde both \
    --output-dir ./rust/crates/db/src/entities
