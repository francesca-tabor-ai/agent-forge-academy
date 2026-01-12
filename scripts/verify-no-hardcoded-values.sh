#!/bin/bash

# Script to verify no hard-coded subscription values remain
# Run this to check for any remaining hard-coded plan/billing/invoice values

echo "🔍 Checking for hard-coded subscription values..."
echo ""

# Search for common hard-coded values
PATTERNS=(
  "Starter"
  "£29"
  "£39"
  "£79"
  "Visa.*4242"
  "info@francescatabor"
  "INV-001"
  "INV-002"
  "15 February"
  "February 2024"
)

FOUND_ISSUES=0

for pattern in "${PATTERNS[@]}"; do
  echo "Checking for: $pattern"
  
  # Search in subscription components and pages
  RESULTS=$(grep -r "$pattern" \
    components/subscription/ \
    app/\(student\)/student/subscription/ \
    --exclude-dir=node_modules \
    -i 2>/dev/null | grep -v "// Format:" | grep -v "// Example:" | grep -v "// Output:" | grep -v "e.g.,")
  
  if [ -n "$RESULTS" ]; then
    echo "  ⚠️  Found potential hard-coded value:"
    echo "$RESULTS" | sed 's/^/    /'
    FOUND_ISSUES=$((FOUND_ISSUES + 1))
  else
    echo "  ✅ No matches found"
  fi
  echo ""
done

# Check for TODO comments about hard-coded values
echo "Checking for TODO comments about hard-coded values..."
TODOS=$(grep -r "TODO.*hard-coded\|TODO.*mock\|TODO.*dummy" \
  components/subscription/ \
  app/\(student\)/student/subscription/ \
  --exclude-dir=node_modules \
  -i 2>/dev/null)

if [ -n "$TODOS" ]; then
  echo "  ⚠️  Found TODO comments:"
  echo "$TODOS" | sed 's/^/    /'
  FOUND_ISSUES=$((FOUND_ISSUES + 1))
else
  echo "  ✅ No TODO comments found"
fi
echo ""

# Summary
if [ $FOUND_ISSUES -eq 0 ]; then
  echo "✅ SUCCESS: No hard-coded values found!"
  echo ""
  echo "All subscription data is sourced from:"
  echo "  - getSubscriptionData() function"
  echo "  - Database queries"
  echo "  - Stripe API"
  exit 0
else
  echo "⚠️  WARNING: Found $FOUND_ISSUES potential issue(s)"
  echo ""
  echo "Please review the matches above and ensure they are:"
  echo "  - Comments/examples only (not actual displayed values)"
  echo "  - Fallback values (only used when data is missing)"
  echo "  - Not displayed to users"
  exit 1
fi
