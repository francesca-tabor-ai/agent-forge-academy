#!/bin/bash
# Refresh Supabase Schema Cache
# Usage: ./scripts/refresh-schema-cache.sh [local|staging|production]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-local}

echo -e "${BLUE}🔄 Supabase Schema Cache Refresh${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
fi

case $ENVIRONMENT in
    local)
        echo -e "${GREEN}📋 Refreshing schema cache for LOCAL environment...${NC}"
        echo ""
        echo -e "${YELLOW}Method: Restart Supabase local instance${NC}"
        echo ""
        
        # Check if supabase CLI is available
        if ! command -v supabase &> /dev/null; then
            echo -e "${RED}❌ Error: Supabase CLI not found${NC}"
            echo "Install with: npm install -g supabase"
            exit 1
        fi
        
        echo -e "${BLUE}Stopping Supabase...${NC}"
        supabase stop || true
        
        echo -e "${BLUE}Starting Supabase...${NC}"
        supabase start
        
        echo ""
        echo -e "${GREEN}✅ Schema cache refreshed!${NC}"
        echo ""
        echo -e "${YELLOW}💡 Tip: Verify with:${NC}"
        echo "  curl -X GET 'http://localhost:54321/rest/v1/student_profiles?select=city&limit=1' \\"
        echo "    -H 'apikey: <your-anon-key>'"
        ;;
        
    staging|production)
        echo -e "${GREEN}📋 Refreshing schema cache for ${ENVIRONMENT^^} environment...${NC}"
        echo ""
        
        # Check for required environment variables
        if [ -z "$SUPABASE_URL" ] && [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
            echo -e "${RED}❌ Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL not set${NC}"
            exit 1
        fi
        
        SUPABASE_URL=${SUPABASE_URL:-$NEXT_PUBLIC_SUPABASE_URL}
        
        if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
            echo -e "${YELLOW}⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not set${NC}"
            echo ""
            echo -e "${BLUE}📝 Manual refresh required:${NC}"
            echo ""
            echo "1. Go to Supabase Dashboard: https://supabase.com/dashboard"
            echo "2. Select your ${ENVIRONMENT} project"
            echo "3. Navigate to: Settings → API"
            echo "4. Click: 'Refresh schema cache' button"
            echo ""
            echo -e "${YELLOW}Or set SUPABASE_SERVICE_ROLE_KEY in .env and run again${NC}"
            exit 0
        fi
        
        # Extract project ref from URL
        PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')
        
        if [ -z "$PROJECT_REF" ]; then
            echo -e "${RED}❌ Error: Could not extract project ref from SUPABASE_URL${NC}"
            exit 1
        fi
        
        echo -e "${BLUE}Project: ${PROJECT_REF}${NC}"
        echo -e "${BLUE}Attempting API refresh...${NC}"
        echo ""
        
        # Try to refresh via API
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
            "https://${PROJECT_REF}.supabase.co/rest/v1/rpc/refresh_schema_cache" \
            -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
            -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
            -H "Content-Type: application/json" \
            -d '{}' 2>&1) || true
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | sed '$d')
        
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
            echo -e "${GREEN}✅ Schema cache refreshed successfully!${NC}"
        elif [ "$HTTP_CODE" = "404" ]; then
            echo -e "${YELLOW}⚠️  API endpoint not available (404)${NC}"
            echo ""
            echo -e "${BLUE}📝 Please refresh manually:${NC}"
            echo ""
            echo "1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
            echo "2. Scroll to 'Schema Cache' section"
            echo "3. Click 'Refresh schema cache' button"
        else
            echo -e "${YELLOW}⚠️  API refresh returned status: ${HTTP_CODE}${NC}"
            echo -e "${YELLOW}Response: ${BODY}${NC}"
            echo ""
            echo -e "${BLUE}📝 Please refresh manually via Dashboard:${NC}"
            echo "  https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Error: Invalid environment '${ENVIRONMENT}'${NC}"
        echo ""
        echo "Usage: $0 [local|staging|production]"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📚 For more information, see:${NC}"
echo "  documentation/setup-config/SCHEMA_CACHE_REFRESH.md"
