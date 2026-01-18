# City Column Fix - Validation Checklist

## Definition of Done

✅ **The database schema and the app's profile payload agree on column names, the API schema cache is refreshed, and the Edit Profile page no longer shows: "Could not find the 'city' column of 'student_profiles' in the schema cache".**

---

## Pre-Deployment Checklist

### 1. Database Schema ✅

- [ ] **Migration files exist and are correct**
  - [ ] `supabase/migrations/20260118232432_ensure_city_country_columns_exist.sql` exists
  - [ ] `supabase/migrations/20260118232433_alter_city_country_to_text.sql` exists
  - [ ] Both migrations use `TEXT` type for `city` and `country`
  - [ ] Migrations are idempotent (use `IF NOT EXISTS`)

- [ ] **Migrations have been applied**
  ```bash
  # Check migration status
  supabase migration list
  
  # Or verify columns exist
  psql $DATABASE_URL -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name IN ('city', 'country');"
  ```
  Expected: Should show `city` and `country` as `text` type

- [ ] **Columns exist in database**
  ```sql
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'student_profiles'
    AND column_name IN ('location', 'city', 'country');
  ```
  Expected:
  - `location`: `text`, nullable
  - `city`: `text`, nullable
  - `country`: `text`, nullable

### 2. Schema Cache Refresh ✅

- [ ] **Local development**
  ```bash
  # Option 1: Restart Supabase
  supabase stop && supabase start
  
  # Option 2: Use refresh script
  ./scripts/refresh-schema-cache.sh local
  ```

- [ ] **Staging environment**
  - [ ] Go to Supabase Dashboard → Settings → API → Refresh schema cache
  - [ ] Or run: `./scripts/refresh-schema-cache.sh staging`

- [ ] **Production environment**
  - [ ] Go to Supabase Dashboard → Settings → API → Refresh schema cache
  - [ ] Or run: `./scripts/refresh-schema-cache.sh production`

- [ ] **Verify cache refresh worked**
  ```bash
  # Test API access to city column
  curl -X GET 'https://your-project.supabase.co/rest/v1/student_profiles?select=id,city&limit=1' \
    -H 'apikey: YOUR_ANON_KEY'
  ```
  Expected: Should return data without errors

### 3. Code Updates ✅

- [ ] **API Route - Profile Update** (`app/api/portfolio/profile/route.ts`)
  - [ ] PATCH route includes `city` and `country` in UPDATE statement
  - [ ] PATCH route includes `city` and `country` in INSERT statement
  - [ ] GET route includes `city` and `country` in SELECT queries
  - [ ] GET route includes `city` and `country` in INSERT statement
  - [ ] Uses `parseLocation()` to extract city and country from location

- [ ] **Profile Edit Page** (`app/(student)/student/portfolio/profile/edit/page.tsx`)
  - [ ] INSERT statement includes `city: null, country: null`

- [ ] **Headshot Upload Route** (`app/api/portfolio/profile/headshot/upload/route.ts`)
  - [ ] All INSERT statements include `city: null, country: null`

- [ ] **Portfolio Page** (`app/(student)/student/portfolio/page.tsx`)
  - [ ] SELECT query includes `city` and `country`

### 4. TypeScript Types ✅

- [ ] **Type definitions exist** (`lib/types/student-profile.ts`)
  - [ ] `StudentProfile` interface includes `city` and `country`
  - [ ] `StudentProfileUpdate` interface includes `city` and `country`
  - [ ] `StudentProfileResponse` interface includes `city` and `country`

- [ ] **Component types are correct**
  - [ ] `ProfileHeader` includes `city?: string | null`
  - [ ] `ProfileEditForm` only uses `location` (correct - API handles parsing)

### 5. Location Parsing ✅

- [ ] **Parse function exists** (`lib/profile/parseLocation.ts`)
  - [ ] Function correctly parses "City, Country" format
  - [ ] Returns normalized city (lowercase)
  - [ ] Handles special cases (Remote, Hybrid, Onsite)
  - [ ] Returns `{ city: string | null, country: string | null }`

- [ ] **API uses parseLocation**
  - [ ] Profile PATCH route calls `parseLocation(location)`
  - [ ] Stores all three: `location`, `city`, `country`

---

## Post-Deployment Validation

### 6. Manual Testing ✅

- [ ] **Edit Profile Page**
  1. Navigate to `/student/portfolio/profile/edit`
  2. Enter location: "London, UK"
  3. Save profile
  4. **Expected:** No errors, profile saves successfully
  5. **Check browser console:** No "city column not found" errors

- [ ] **View Profile Page**
  1. Navigate to `/student/portfolio`
  2. **Expected:** Profile displays correctly
  3. **Expected:** City banner image shows if city is set
  4. **Check browser console:** No errors

- [ ] **API Direct Test**
  ```bash
  # Test GET endpoint
  curl -X GET 'http://localhost:3000/api/portfolio/profile' \
    -H 'Cookie: your-session-cookie'
  
  # Test PATCH endpoint
  curl -X PATCH 'http://localhost:3000/api/portfolio/profile' \
    -H 'Content-Type: application/json' \
    -H 'Cookie: your-session-cookie' \
    -d '{"location": "San Francisco, CA", "headline": "Test"}'
  ```
  **Expected:** Both return 200 with profile data including `city` and `country`

### 7. Schema Validation ✅

- [ ] **Run validation script**
  ```bash
  npm run validate:schema
  ```
  **Expected:** 
  ```
  ✅ All 16 required columns exist
  📍 Location fields: ✓ ✓ ✓ (location, city, country)
  ✅ Schema validation passed!
  ```

- [ ] **Health check endpoint**
  ```bash
  curl http://localhost:3000/api/health/schema
  ```
  **Expected:**
  ```json
  {
    "ok": true,
    "status": "schema_valid",
    "message": "All required columns exist"
  }
  ```

### 8. Error Verification ✅

- [ ] **No "city column not found" errors**
  - [ ] Check browser console (no errors)
  - [ ] Check server logs (no schema errors)
  - [ ] Check network tab (API calls succeed)

- [ ] **Database queries work**
  ```sql
  -- Test SELECT with city
  SELECT id, location, city, country 
  FROM student_profiles 
  LIMIT 1;
  
  -- Test UPDATE with city
  UPDATE student_profiles 
  SET city = 'test', country = 'TEST' 
  WHERE id = 'some-id';
  ```
  **Expected:** Both queries execute without errors

### 9. Integration Testing ✅

- [ ] **Location parsing works**
  1. Update profile with "London, UK"
  2. Check database: `city` should be "london", `country` should be "UK"
  3. Update profile with "Remote"
  4. Check database: `city` should be `null`, `country` should be `null`

- [ ] **City banner images work**
  1. Set location to a known city (e.g., "London, UK")
  2. View profile page
  3. **Expected:** City-specific banner image displays

- [ ] **Form submission works**
  1. Fill out profile edit form
  2. Submit form
  3. **Expected:** Success message, redirect to portfolio page
  4. **Expected:** No console errors

---

## Production Deployment Checklist

### 10. Pre-Production ✅

- [ ] All migrations applied to production database
- [ ] Schema cache refreshed in production
- [ ] Validation script passes in production environment
- [ ] Health check endpoint returns 200 in production

### 11. Production Verification ✅

- [ ] **Monitor for errors**
  - [ ] Check error tracking (Sentry, etc.) for schema errors
  - [ ] Check application logs for "city column" errors
  - [ ] Monitor for 24 hours after deployment

- [ ] **User testing**
  - [ ] Test profile edit functionality
  - [ ] Verify location updates work
  - [ ] Check city banner images display correctly

### 12. Rollback Plan ✅

- [ ] **If errors occur:**
  1. Check if migrations were applied
  2. Verify schema cache was refreshed
  3. Run validation script to identify issues
  4. Check application logs for specific errors
  5. Rollback code if necessary (migrations are idempotent)

---

## Quick Verification Commands

```bash
# 1. Validate schema
npm run validate:schema

# 2. Check health endpoint
curl http://localhost:3000/api/health/schema

# 3. Test API directly (replace with your auth token)
curl -X GET 'http://localhost:3000/api/portfolio/profile' \
  -H 'Cookie: your-session'

# 4. Refresh schema cache
./scripts/refresh-schema-cache.sh local

# 5. Check database columns
psql $DATABASE_URL -c "
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'student_profiles' 
    AND column_name IN ('city', 'country', 'location');
"
```

---

## Success Criteria

✅ **All of the following must be true:**

1. ✅ Database has `city` and `country` columns (TEXT, nullable)
2. ✅ Schema cache has been refreshed
3. ✅ All INSERT/UPDATE queries include `city` and `country`
4. ✅ All SELECT queries that need them include `city` and `country`
5. ✅ Edit Profile page saves without errors
6. ✅ No "city column not found" errors in console/logs
7. ✅ Location parsing works correctly
8. ✅ City banner images display correctly
9. ✅ Schema validation script passes
10. ✅ Health check endpoint returns 200

---

## Documentation

- [x] Schema cache refresh guide created
- [x] Location field mapping documentation created
- [x] Profile schema verification document created
- [x] Schema validation guardrails documentation created
- [x] This validation checklist created

---

## Related Files

- `supabase/migrations/20260118232432_ensure_city_country_columns_exist.sql`
- `supabase/migrations/20260118232433_alter_city_country_to_text.sql`
- `app/api/portfolio/profile/route.ts`
- `lib/profile/parseLocation.ts`
- `lib/types/student-profile.ts`
- `scripts/validate-schema.ts`
- `scripts/refresh-schema-cache.sh`
- `app/api/health/schema/route.ts`

---

**Last Updated:** 2026-01-18  
**Status:** ✅ Ready for validation
