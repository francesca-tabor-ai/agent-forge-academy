#!/bin/bash

# Smoke test script to verify key schema elements after migrations
# Usage: ./scripts/smoke-test-schema.sh

set -e

# Set your database connection details
DB_HOST="${DB_HOST:-aws-1-eu-west-1.pooler.supabase.com}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres.YOUR_PROJECT_REF}"
DB_PASSWORD="${DB_PASSWORD}"

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD is not set!"
    echo "Set it with: export DB_PASSWORD='your-password'"
    exit 1
fi

echo "🔍 Running smoke tests on database schema..."
echo ""

# Test 1: Check migration count
echo "1. Checking applied migrations..."
MIGRATION_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -t -c "SELECT COUNT(*) FROM supabase_migrations.schema_migrations;" | tr -d ' ')
echo "   ✅ Found $MIGRATION_COUNT applied migrations"
echo ""

# Test 2: Check key tables exist
echo "2. Verifying key tables exist..."
TABLES=("profiles" "student_profiles" "courses" "subscriptions" "portfolio_projects")
for table in "${TABLES[@]}"; do
    EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" | tr -d ' ')
    if [ "$EXISTS" = "t" ]; then
        echo "   ✅ $table exists"
    else
        echo "   ❌ $table missing"
    fi
done
echo ""

# Test 3: Check RLS is enabled
echo "3. Verifying RLS is enabled on key tables..."
for table in "${TABLES[@]}"; do
    RLS_ENABLED=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -t -c "SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = '$table';" | tr -d ' ')
    if [ "$RLS_ENABLED" = "t" ]; then
        echo "   ✅ RLS enabled on $table"
    else
        echo "   ⚠️  RLS not enabled on $table"
    fi
done
echo ""

# Test 4: Check for indexes
echo "4. Checking key indexes..."
INDEX_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('profiles', 'student_profiles', 'courses');" | tr -d ' ')
echo "   ✅ Found $INDEX_COUNT indexes on key tables"
echo ""

# Test 5: Check enum types
echo "5. Verifying enum types..."
ENUMS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -t -c "SELECT COUNT(*) FROM pg_type WHERE typname IN ('user_role', 'subscription_tier');" | tr -d ' ')
echo "   ✅ Found $ENUMS enum types"
echo ""

echo "✨ Smoke tests completed!"
echo ""
echo "For detailed verification, run: scripts/verify-migration-completion.sql in Supabase SQL Editor"
