#!/bin/bash

# Script to run all migrations from the "to do" folder
# Usage: ./scripts/run-all-migrations.sh [method]
# Methods: psql, supabase-cli, or sql-editor (default: psql)

set -e

MIGRATIONS_DIR="supabase/migrations/to do"
METHOD="${1:-psql}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Running all migrations from 'to do' folder${NC}"
echo ""

# Count migrations
MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l | tr -d ' ')
echo -e "${YELLOW}Found $MIGRATION_COUNT migration files${NC}"
echo ""

if [ "$METHOD" = "psql" ]; then
    echo -e "${YELLOW}Using psql method${NC}"
    echo "Make sure you have your database connection details set:"
    echo ""
    echo "export DB_HOST='your-host'"
    echo "export DB_PORT='5432'"
    echo "export DB_NAME='postgres'"
    echo "export DB_USER='postgres.your-project-ref'"
    echo "export DB_PASSWORD='your-password'"
    echo ""
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ]; then
        echo -e "${RED}❌ Database connection variables not set!${NC}"
        echo "Please set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD"
        exit 1
    fi
    
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-postgres}"
    
    echo -e "${GREEN}Connecting to: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME${NC}"
    echo ""
    
    # Run migrations in order
    COUNTER=0
    for migration in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration" ]; then
            COUNTER=$((COUNTER + 1))
            filename=$(basename "$migration")
            echo -e "${YELLOW}[$COUNTER/$MIGRATION_COUNT] Running: $filename${NC}"
            
            PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -f "$migration"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Success: $filename${NC}"
            else
                echo -e "${RED}❌ Failed: $filename${NC}"
                echo "Stopping migration process..."
                exit 1
            fi
            echo ""
        fi
    done
    
    echo -e "${GREEN}✨ All migrations completed!${NC}"

elif [ "$METHOD" = "supabase-cli" ]; then
    echo -e "${YELLOW}Using Supabase CLI method${NC}"
    echo ""
    
    # Check if supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        echo -e "${RED}❌ Supabase CLI is not installed${NC}"
        echo "Install it with: npm install -g supabase"
        exit 1
    fi
    
    # Check if project is linked
    if ! supabase status &> /dev/null; then
        echo -e "${RED}❌ Project is not linked${NC}"
        echo "Link your project with: supabase link --project-ref YOUR_PROJECT_REF"
        exit 1
    fi
    
    echo -e "${YELLOW}Note: Supabase CLI runs migrations from supabase/migrations/ directory${NC}"
    echo "You may need to temporarily move files back or use psql method instead"
    echo ""
    echo "Alternatively, use: supabase db push"
    exit 1

elif [ "$METHOD" = "sql-editor" ]; then
    echo -e "${YELLOW}SQL Editor Method${NC}"
    echo ""
    echo "To run migrations via Supabase SQL Editor:"
    echo "1. Go to your Supabase Dashboard → SQL Editor"
    echo "2. Run each migration file in order"
    echo ""
    echo "Here are all migration files in order:"
    echo ""
    
    COUNTER=0
    for migration in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration" ]; then
            COUNTER=$((COUNTER + 1))
            filename=$(basename "$migration")
            echo "[$COUNTER] $filename"
        fi
    done
    
    echo ""
    echo "Or use this command to generate a combined SQL file:"
    echo "cat \"$MIGRATIONS_DIR\"/*.sql > all-migrations-combined.sql"

else
    echo -e "${RED}Unknown method: $METHOD${NC}"
    echo "Available methods: psql, supabase-cli, sql-editor"
    exit 1
fi
