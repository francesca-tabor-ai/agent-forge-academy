#!/bin/bash
# Test Supabase database connection
# Usage: ./scripts/test-db-connection.sh

set -e

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ Error: .env file not found"
    echo "Please create .env file with SUPABASE_DB_URL"
    exit 1
fi

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Error: SUPABASE_DB_URL not set in .env file"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    # Try to use libpq from Homebrew
    if [ -f /opt/homebrew/opt/libpq/bin/psql ]; then
        export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
    else
        echo "❌ Error: psql not found"
        echo "Install with: brew install libpq"
        exit 1
    fi
fi

echo "🔌 Testing database connection..."
echo "Connection string: ${SUPABASE_DB_URL//:*@/:***@}"  # Hide password

# Test connection
if psql "$SUPABASE_DB_URL" -c "SELECT now();" > /dev/null 2>&1; then
    echo "✅ Connection successful!"
    psql "$SUPABASE_DB_URL" -c "SELECT version();"
else
    echo "❌ Connection failed"
    echo "Please verify your SUPABASE_DB_URL in .env file"
    exit 1
fi
