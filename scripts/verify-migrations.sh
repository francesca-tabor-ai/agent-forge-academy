#!/bin/bash

# Script to verify all migrations have been pushed to Supabase
# Usage: ./scripts/verify-migrations.sh

set -e

echo "🔍 Verifying Supabase Migrations Status"
echo "========================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "   Install it with: npm install -g supabase"
    exit 1
fi

# Check if project is linked
echo "📋 Checking project status..."
if ! supabase status &> /dev/null; then
    echo "⚠️  Project is not linked to Supabase."
    echo "   Run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Project is linked"
echo ""

# Get list of local migrations
echo "📁 Local migrations:"
LOCAL_MIGRATIONS=$(ls -1 supabase/migrations/*.sql 2>/dev/null | xargs -n1 basename | sort)
LOCAL_COUNT=$(echo "$LOCAL_MIGRATIONS" | wc -l | tr -d ' ')
echo "   Found $LOCAL_COUNT migration files"
echo ""

# Get list of remote migrations
echo "☁️  Remote migrations (from Supabase):"
echo "   Fetching remote migration list..."
REMOTE_MIGRATIONS=$(supabase migration list --db-url "$(supabase status --output json 2>/dev/null | grep -oP '"DB_URL":"\K[^"]*' || echo '')" 2>/dev/null | grep -E '^\s*[0-9]' | awk '{print $1}' | sort || echo "")

if [ -z "$REMOTE_MIGRATIONS" ]; then
    echo "   ⚠️  Could not fetch remote migrations via CLI"
    echo "   💡 Try using the SQL method instead (see verify-migrations.sql)"
    echo ""
    echo "   Or check manually with:"
    echo "   supabase db remote list"
else
    REMOTE_COUNT=$(echo "$REMOTE_MIGRATIONS" | wc -l | tr -d ' ')
    echo "   Found $REMOTE_COUNT applied migrations"
    echo ""
fi

# Compare migrations
echo "🔍 Comparison:"
echo ""

# Check for missing migrations
MISSING_COUNT=0
for migration in $LOCAL_MIGRATIONS; do
    version=$(echo "$migration" | grep -oE '[0-9]{14}' | head -1)
    if [ -n "$version" ]; then
        if echo "$REMOTE_MIGRATIONS" | grep -q "$version" 2>/dev/null; then
            echo "   ✅ $migration"
        else
            echo "   ❌ $migration (NOT APPLIED)"
            MISSING_COUNT=$((MISSING_COUNT + 1))
        fi
    fi
done

echo ""
echo "========================================"
if [ "$MISSING_COUNT" -eq 0 ]; then
    echo "✅ All migrations are applied!"
else
    echo "⚠️  $MISSING_COUNT migration(s) not applied"
    echo ""
    echo "To apply missing migrations, run:"
    echo "   supabase db push"
fi
echo ""

# Alternative: Show diff
echo "💡 Alternative: Check differences with:"
echo "   supabase db diff"
echo ""
