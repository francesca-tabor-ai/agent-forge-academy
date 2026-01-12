#!/bin/bash
# Grant Professional Access to a specific user
# Usage: ./scripts/grant-professional-access.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables from .env file
# Filter out PORT and other variables that might interfere with psql
if [ -f .env ]; then
    # Load .env line by line, excluding PORT and other problematic vars
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "${line// }" ]] && continue
        
        # Skip PORT variable if it exists (it interferes with psql)
        [[ "$line" =~ ^[[:space:]]*PORT= ]] && continue
        
        # Export the variable
        export "$line" 2>/dev/null || true
    done < .env
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file with SUPABASE_DB_URL"
    exit 1
fi

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}❌ Error: SUPABASE_DB_URL not set in .env file${NC}"
    echo ""
    echo "Get your connection string from: Supabase Dashboard → Project Settings → Database"
    echo "Use the 'Direct connection' or 'Transaction pooler' connection string"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    # Try to use libpq from Homebrew
    if [ -f /opt/homebrew/opt/libpq/bin/psql ]; then
        export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
    else
        echo -e "${RED}❌ Error: psql not found${NC}"
        echo "Install with: brew install libpq"
        exit 1
    fi
fi

echo -e "${GREEN}🔐 Granting Professional Access to user...${NC}"
echo ""

# Run the grant script
psql "$SUPABASE_DB_URL" -f supabase/seed/grant_professional_access.sql

echo ""
echo -e "${GREEN}✅ Done!${NC}"
