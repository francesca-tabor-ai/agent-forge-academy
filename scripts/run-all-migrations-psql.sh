#!/bin/bash

# Quick script to run all migrations using psql
# Set your database connection details first

set -e

MIGRATIONS_DIR="supabase/migrations/to do"

# Set your database connection details here
DB_HOST="${DB_HOST:-aws-1-eu-west-1.pooler.supabase.com}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres.YOUR_PROJECT_REF}"
DB_PASSWORD="${DB_PASSWORD}"

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD is not set!"
    echo ""
    echo "Set it with: export DB_PASSWORD='your-password'"
    echo "Or edit this script to set it directly"
    exit 1
fi

echo "🚀 Running all migrations..."
echo ""

# Sort migrations by filename to ensure correct order
COUNTER=0
TOTAL=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l | tr -d ' ')

for migration in $(ls -1 "$MIGRATIONS_DIR"/*.sql | sort); do
    if [ -f "$migration" ]; then
        COUNTER=$((COUNTER + 1))
        filename=$(basename "$migration")
        echo "[$COUNTER/$TOTAL] Running: $filename"
        
        PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -d "$DB_NAME" \
            -U "$DB_USER" \
            -f "$migration" \
            -v ON_ERROR_STOP=1
        
        if [ $? -eq 0 ]; then
            echo "✅ Success"
        else
            echo "❌ Failed - stopping"
            exit 1
        fi
        echo ""
    fi
done

echo "✨ All migrations completed!"
