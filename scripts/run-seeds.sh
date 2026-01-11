#!/bin/bash
# Run Supabase seed scripts in order
# Usage: ./scripts/run-seeds.sh [--reset]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file with SUPABASE_DB_URL"
    exit 1
fi

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}❌ Error: SUPABASE_DB_URL not set in .env file${NC}"
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

# Check for --reset flag
RESET=false
if [ "$1" == "--reset" ]; then
    RESET=true
    echo -e "${YELLOW}⚠️  WARNING: Reset mode enabled. This will delete seed data!${NC}"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi
fi

# Seed directory
SEED_DIR="supabase/seed"

# Function to run a seed file
run_seed() {
    local file=$1
    local description=$2
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  Warning: $file not found, skipping...${NC}"
        return 0
    fi
    
    echo -e "${GREEN}📦 Running: $description${NC}"
    echo "   File: $file"
    
    if psql "$SUPABASE_DB_URL" -f "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Success${NC}"
    else
        echo -e "${RED}   ❌ Failed${NC}"
        echo "   Running with error output:"
        psql "$SUPABASE_DB_URL" -f "$file" || true
        return 1
    fi
}

# Main execution
echo -e "${GREEN}🌱 Starting seed workflow...${NC}"
echo ""

# Optional reset
if [ "$RESET" = true ]; then
    run_seed "$SEED_DIR/00_reset.sql" "Reset (Optional)"
    echo ""
fi

# Run seed files in dependency order
run_seed "$SEED_DIR/01_seed_core.sql" "Seed Core Data (Subscription Plans)"
echo ""

run_seed "$SEED_DIR/02_seed_content.sql" "Seed Content (Courses)"
echo ""

run_seed "$SEED_DIR/03_seed_events.sql" "Seed Events"
echo ""

run_seed "$SEED_DIR/04_seed_jobs_offers.sql" "Seed Jobs & Offers"
echo ""

run_seed "$SEED_DIR/05_seed_user_dependent.sql" "Seed User-Dependent Data (Examples)"
echo ""

# Verification
run_seed "$SEED_DIR/99_verify.sql" "Verify Seed Data"
echo ""

echo -e "${GREEN}✅ Seed workflow completed!${NC}"
