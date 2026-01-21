#!/bin/bash

# Script to organize migrations after running them
# This will query the database and move applied migrations to "migrated" folder

set -e

echo "🔍 Getting list of applied migrations from database..."
echo ""

# Get applied migrations and save to temp file
TEMP_FILE=$(mktemp)
./scripts/get-applied-migrations.sh > "$TEMP_FILE"

APPLIED_COUNT=$(wc -l < "$TEMP_FILE" | tr -d ' ')
echo "✅ Found $APPLIED_COUNT applied migrations"
echo ""

# Run the organize script
echo "📁 Organizing migrations..."
tsx scripts/organize-migrations.ts "$TEMP_FILE"

# Clean up
rm "$TEMP_FILE"

echo ""
echo "✨ Done! Check supabase/migrations/migrated/ and supabase/migrations/to do/"
