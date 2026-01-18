# Schema Validation Guardrails

## Overview

This document describes the guardrails in place to prevent schema mismatches between code and database. These validations catch issues early before they cause runtime errors.

## Guardrails Implemented

### 1. Schema Validation Script

**Location:** `scripts/validate-schema.ts`

**Purpose:** Validates that all required columns exist in the database schema.

**Usage:**
```bash
# Run validation
npm run validate:schema

# Or directly
tsx scripts/validate-schema.ts
```

**What it checks:**
- Verifies all required columns exist in `student_profiles` table
- Specifically validates `city` and `country` columns (critical for location parsing)
- Provides clear error messages if columns are missing

**Exit codes:**
- `0` - All validations passed
- `1` - Validation failed (missing columns)

**Example output:**
```
🔍 Validating database schema...

📋 Checking table: student_profiles
   ✅ All 16 required columns exist
   📍 Location fields: ✓ ✓ ✓ (location, city, country)

✅ Schema validation passed!
```

### 2. Health Check Endpoint

**Location:** `app/api/health/schema/route.ts`

**Purpose:** Runtime health check that validates schema on application startup or via monitoring.

**Endpoint:** `GET /api/health/schema`

**Usage:**
```bash
# Check schema health
curl http://localhost:3000/api/health/schema

# Or in production
curl https://your-app.com/api/health/schema
```

**Response (Success):**
```json
{
  "ok": true,
  "status": "schema_valid",
  "message": "All required columns exist",
  "validatedTable": "student_profiles",
  "validatedColumns": 16,
  "timestamp": "2026-01-18T12:00:00.000Z"
}
```

**Response (Failure):**
```json
{
  "ok": false,
  "status": "schema_validation_failed",
  "error": "Required columns missing from student_profiles table",
  "details": "Could not find the 'city' column...",
  "requiredColumns": ["id", "profile_id", "city", "country", ...],
  "suggestion": "Run migrations and refresh schema cache"
}
```

### 3. CI/CD Integration

**Location:** `.github/workflows/schema-validation.yml`

**Purpose:** Automatically validates schema on every push/PR that touches migrations or API code.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch
- When files in `supabase/migrations/`, `app/api/`, or `lib/` change

**What it does:**
1. Checks out code
2. Installs dependencies
3. Runs `npm run validate:schema`
4. Fails the build if validation fails

**Setup:**
1. Add secrets to GitHub repository:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. The workflow will run automatically on relevant changes

## Integration Options

### Option A: Pre-commit Hook

Add to `.husky/pre-commit` or `.git/hooks/pre-commit`:

```bash
#!/bin/sh
npm run validate:schema
```

### Option B: Startup Health Check

Add to your application startup (e.g., `app/layout.tsx` or middleware):

```typescript
// Only in production/staging
if (process.env.NODE_ENV === 'production') {
  fetch('/api/health/schema')
    .then(res => res.json())
    .then(data => {
      if (!data.ok) {
        console.error('Schema validation failed:', data);
        // Log to monitoring service
      }
    })
    .catch(err => {
      console.error('Health check failed:', err);
    });
}
```

### Option C: Monitoring Integration

Configure your monitoring service (e.g., Vercel, Datadog, Sentry) to:

1. **Monitor endpoint:** `GET /api/health/schema`
2. **Alert on:** Non-200 status codes
3. **Check frequency:** Every 5 minutes

**Vercel example:**
```json
{
  "checks": [
    {
      "name": "Schema Validation",
      "path": "/api/health/schema",
      "interval": 300
    }
  ]
}
```

## Required Columns

The validation checks for these columns in `student_profiles`:

### Core Fields
- `id`, `profile_id`, `visibility`
- `created_at`, `updated_at`

### Profile Content
- `full_name`, `headline`, `bio`, `skills`
- `headshot_image_url`

### Location Fields (Critical)
- `location` - Original user input
- `city` - Normalized city key ⚠️ **Required**
- `country` - Country/state ⚠️ **Required**

### Social Links
- `linkedin_url`, `github_url`, `website_url`

## Troubleshooting

### Validation Fails

**Error:** "Missing columns: city, country"

**Solution:**
1. Run migrations:
   ```bash
   supabase db push
   # Or
   npm run migrate
   ```

2. Refresh schema cache:
   ```bash
   ./scripts/refresh-schema-cache.sh local
   # Or via Supabase Dashboard
   ```

3. Re-run validation:
   ```bash
   npm run validate:schema
   ```

### Health Check Fails in Production

**Error:** `/api/health/schema` returns 500

**Steps:**
1. Check application logs for detailed error
2. Verify migrations have been applied to production
3. Refresh Supabase schema cache in production dashboard
4. Check if columns exist:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'student_profiles' 
     AND column_name IN ('city', 'country');
   ```

### CI/CD Fails

**Error:** Workflow fails on schema validation

**Steps:**
1. Check workflow logs for specific missing columns
2. Ensure migrations are committed to the branch
3. Verify secrets are set in GitHub repository settings
4. Run validation locally to debug:
   ```bash
   npm run validate:schema
   ```

## Best Practices

1. **Run before deploying:** Always run `npm run validate:schema` before deploying
2. **Monitor health endpoint:** Set up alerts for schema validation failures
3. **Update on schema changes:** Add new required columns to validation script
4. **Document changes:** Update this document when adding new validations
5. **Test locally first:** Run validation locally before pushing changes

## Adding New Validations

To add validation for a new table or column:

1. **Update validation script** (`scripts/validate-schema.ts`):
   ```typescript
   const REQUIRED_COLUMNS = {
     student_profiles: [...existing, 'new_column'],
     new_table: ['id', 'name', ...],
   };
   ```

2. **Update health check** (`app/api/health/schema/route.ts`):
   ```typescript
   const requiredColumns = [...existing, 'new_column'];
   ```

3. **Test locally:**
   ```bash
   npm run validate:schema
   ```

4. **Update documentation:** Add new table/column to this document

## Related Documentation

- [Schema Cache Refresh Guide](./SCHEMA_CACHE_REFRESH.md)
- [Location Field Mapping](../cv-portfolio/LOCATION_CITY_COUNTRY_MAPPING.md)
- [Profile Schema Verification](../cv-portfolio/PROFILE_SCHEMA_VERIFICATION.md)

---

**Last Updated:** 2026-01-18  
**Maintained By:** Development Team
