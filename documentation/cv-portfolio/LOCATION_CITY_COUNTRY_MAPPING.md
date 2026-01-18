# Location, City, and Country Field Mapping

## Overview

The application uses a **single "Location" field in the UI** that gets parsed into three database columns:
- `location` (TEXT, nullable) - Original user input (e.g., "London, UK")
- `city` (TEXT, nullable) - Normalized city name (lowercase, e.g., "london")
- `country` (TEXT, nullable) - Country/state (e.g., "UK")

## Data Flow

### UI → API → Database

```
User Input: "London, UK"
    ↓
Form sends: { location: "London, UK" }
    ↓
API parses: parseLocation("London, UK")
    ↓
Returns: { city: "london", country: "UK" }
    ↓
Database stores:
  - location: "London, UK"  (original)
  - city: "london"          (normalized)
  - country: "UK"           (extracted)
```

## Code Mapping Verification

### ✅ Correct Implementation

**1. Profile Edit Form** (`components/portfolio/ProfileEditForm.tsx`)
- ✅ Sends `location` field only
- ✅ No direct `city` or `country` fields in form

**2. Profile API Route** (`app/api/portfolio/profile/route.ts`)
- ✅ Receives `location` from request body
- ✅ Uses `parseLocation(location)` to extract `city` and `country`
- ✅ Stores all three: `location`, `city`, `country`
- ✅ SELECT queries include `city` and `country`

**3. Parse Location Function** (`lib/profile/parseLocation.ts`)
- ✅ Parses "City, Country" format
- ✅ Normalizes city to lowercase
- ✅ Handles special cases (Remote, Hybrid, Onsite)
- ✅ Returns `{ city: string | null, country: string | null }`

### ⚠️ Areas Needing Attention

**1. Profile Edit Page** (`app/(student)/student/portfolio/profile/edit/page.tsx`)
- ⚠️ SELECT query doesn't include `city` and `country` (acceptable for display)
- ⚠️ INSERT doesn't include `city` and `country` (should include for consistency)

**2. Headshot Upload Route** (`app/api/portfolio/profile/headshot/upload/route.ts`)
- ⚠️ INSERT doesn't include `city` and `country` (should include for consistency)

**3. Onboarding** (`app/auth/onboarding/OnboardingClient.tsx`)
- ✅ Minimal INSERT is acceptable (only creates with `visibility`)

## Database Schema

```sql
-- student_profiles table
location TEXT NULLABLE        -- Original user input
city TEXT NULLABLE            -- Normalized city (lowercase key)
country TEXT NULLABLE         -- Country/state
```

## Column Usage

### `location` Column
- **Purpose**: Store original user input for display
- **Used in**: UI display, form pre-fill
- **Example**: "London, UK", "San Francisco, CA", "Remote"

### `city` Column
- **Purpose**: Normalized city key for banner image matching
- **Used in**: City banner image resolution (`resolveCityBanner(city)`)
- **Format**: Lowercase, normalized (e.g., "london", "san francisco")
- **Indexed**: Yes (for faster lookups)

### `country` Column
- **Purpose**: Store country/state information
- **Used in**: Future filtering, analytics
- **Format**: As provided by user (e.g., "UK", "CA", "USA")

## Parse Location Examples

| Input | city | country |
|-------|------|---------|
| "London, UK" | "london" | "UK" |
| "San Francisco, CA" | "san francisco" | "CA" |
| "New York" | "new york" | null |
| "Remote" | null | null |
| "Hybrid" | null | null |
| "" | null | null |

## Best Practices

1. **Always parse location**: Use `parseLocation()` function when storing location
2. **Store all three fields**: Store `location`, `city`, and `country` together
3. **Use location for display**: Display `location` to users (original format)
4. **Use city for matching**: Use `city` for banner image matching
5. **Include in SELECT**: Include `city` and `country` in SELECT queries that need them
6. **Include in INSERT**: Include `city: null, country: null` in INSERT statements for consistency

## Migration Checklist

When adding/modifying location fields:

- [ ] Update form to send `location` only
- [ ] Update API to parse `location` using `parseLocation()`
- [ ] Update INSERT statements to include `city` and `country`
- [ ] Update SELECT statements to include `city` and `country` if needed
- [ ] Test with various location formats
- [ ] Verify city banner images work correctly
- [ ] Refresh schema cache after migration

## Related Files

- `lib/profile/parseLocation.ts` - Location parsing function
- `app/api/portfolio/profile/route.ts` - Profile API with parsing
- `components/portfolio/ProfileEditForm.tsx` - Profile edit form
- `lib/cityBanners.ts` - City banner image resolution
- `components/portfolio/ProfileHeader.tsx` - Uses city for banner

---

**Last Updated:** 2026-01-18  
**Maintained By:** Development Team
