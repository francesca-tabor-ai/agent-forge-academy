#!/bin/bash
# Discover database schema for seed script generation
# Usage: ./scripts/discover-schema.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Please create .env file with SUPABASE_DB_URL"
    exit 1
fi

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  Warning: SUPABASE_DB_URL not set in .env file${NC}"
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

echo -e "${GREEN}📊 Discovering database schema...${NC}"
echo ""

# Output file
SCHEMA_OUTPUT="supabase/seed/SCHEMA_DISCOVERY.md"

echo "# Database Schema Discovery" > "$SCHEMA_OUTPUT"
echo "" >> "$SCHEMA_OUTPUT"
echo "Generated: $(date)" >> "$SCHEMA_OUTPUT"
echo "" >> "$SCHEMA_OUTPUT"

# Get all tables and columns
echo -e "${GREEN}📋 Querying table columns...${NC}"
echo "" >> "$SCHEMA_OUTPUT"
echo "## Tables and Columns" >> "$SCHEMA_OUTPUT"
echo "" >> "$SCHEMA_OUTPUT"
echo '```' >> "$SCHEMA_OUTPUT"
psql "$SUPABASE_DB_URL" -c "
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public'
order by table_name, ordinal_position;
" >> "$SCHEMA_OUTPUT"
echo '```' >> "$SCHEMA_OUTPUT"
echo "" >> "$SCHEMA_OUTPUT"

# Get foreign keys
echo -e "${GREEN}🔗 Querying foreign key relationships...${NC}"
echo "" >> "$SCHEMA_OUTPUT"
echo "## Foreign Key Relationships" >> "$SCHEMA_OUTPUT"
echo "" >> "$SCHEMA_OUTPUT"
echo '```' >> "$SCHEMA_OUTPUT"
psql "$SUPABASE_DB_URL" -c "
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as references_table,
  ccu.column_name as references_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
order by tc.table_name;
" >> "$SCHEMA_OUTPUT"
echo '```' >> "$SCHEMA_OUTPUT"
echo "" >> "$SCHEMA_OUTPUT"

echo -e "${GREEN}✅ Schema discovery complete!${NC}"
echo "Results saved to: $SCHEMA_OUTPUT"
