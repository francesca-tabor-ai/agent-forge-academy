#!/bin/bash

# Script to get list of applied migrations from database
# Usage: ./scripts/get-applied-migrations.sh > applied-migrations.txt

set -e

# Set your database connection details
DB_HOST="${DB_HOST:-aws-1-eu-west-1.pooler.supabase.com}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres.YOUR_PROJECT_REF}"
DB_PASSWORD="${DB_PASSWORD}"

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD is not set!" >&2
    echo "Set it with: export DB_PASSWORD='your-password'" >&2
    exit 1
fi

# Query to get all applied migration versions
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -d "$DB_NAME" \
    -U "$DB_USER" \
    -t \
    -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;" \
    | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//' | grep -v '^$'
