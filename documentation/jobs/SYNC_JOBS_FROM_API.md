# Sync Jobs from External API to Database

This guide explains how to sync jobs from external APIs (JSearch/RapidAPI or APIJobs) to your database.

## Quick Start

### 1. Test with Dry Run (Recommended First)

```bash
# Test with JSearch API (RapidAPI) - dry run
npm run sync:jobs:dry-run -- --api=jsearch --query="AI engineer" --remote

# Test with APIJobs API - dry run
npm run sync:jobs:dry-run -- --api=apijobs --query="software engineer"
```

### 2. Sync Jobs to Database

```bash
# Sync from JSearch API
npm run sync:jobs -- --api=jsearch --query="AI engineer" --remote --limit=20

# Sync from APIJobs API
npm run sync:jobs -- --api=apijobs --query="data scientist" --location="San Francisco"
```

## Command Line Options

| Option | Description | Default | Example |
|-------|-------------|---------|---------|
| `--api` | API provider: `jsearch` or `apijobs` | `jsearch` | `--api=apijobs` |
| `--query` | Search query | `"software engineer"` | `--query="machine learning"` |
| `--location` | Location filter (optional) | - | `--location="San Francisco"` |
| `--remote` | Fetch remote jobs only | `false` | `--remote` |
| `--limit` | Max jobs to fetch | `50` | `--limit=100` |
| `--dry-run` | Preview without inserting | `false` | `--dry-run` |

## Examples

### Example 1: Sync Remote AI Jobs

```bash
npm run sync:jobs -- --api=jsearch --query="AI engineer" --remote --limit=30
```

### Example 2: Sync Jobs in Specific Location

```bash
npm run sync:jobs -- --api=jsearch --query="software developer" --location="New York" --limit=50
```

### Example 3: Sync from APIJobs with Custom Query

```bash
npm run sync:jobs -- --api=apijobs --query="machine learning engineer" --remote
```

### Example 4: Preview Before Syncing

```bash
# First, see what would be synced
npm run sync:jobs:dry-run -- --api=jsearch --query="data scientist" --remote

# Then actually sync
npm run sync:jobs -- --api=jsearch --query="data scientist" --remote
```

## Environment Variables

Make sure you have the required environment variables set:

### For JSearch API (RapidAPI)

```env
RAPID_API_KEY=your_rapid_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### For APIJobs API

```env
APIJOBS_API_KEY=your_apijobs_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## How It Works

1. **Fetches Jobs**: Calls the external API with your query parameters
2. **Transforms Data**: Maps API response to your database schema:
   - Extracts skills from job descriptions
   - Maps employment types to job types (full_time, part_time, etc.)
   - Infers experience levels from job titles/descriptions
   - Formats salary ranges
   - Normalizes locations
3. **Deduplicates**: Checks for existing jobs by:
   - `external_url` (if available)
   - `title + company` (fallback)
4. **Upserts**: Inserts new jobs or updates existing ones

## Data Mapping

### Job Types

| API Value | Database Value |
|-----------|----------------|
| "FULLTIME", "PERMANENT" | `full_time` |
| "PARTTIME" | `part_time` |
| "CONTRACTOR", "FREELANCE" | `contract` |
| "INTERN" | `internship` |
| Default | `full_time` |

### Experience Levels

Inferred from job title and description:

- **entry**: "junior", "entry", "graduate", "intern", "0-2 years"
- **mid**: Default if not clearly entry or senior
- **senior**: "senior", "sr", "3+ years"
- **lead**: "lead", "principal", "staff"
- **executive**: "executive", "vp", "director", "c-level"

### Skills Extraction

Skills are extracted from:
- `job_required_skills` (if available)
- `job_highlights.Qualifications`
- Job description (keyword matching for common tech skills)

## Troubleshooting

### Issue: "RAPID_API_KEY not found"

**Solution**: 
1. Check `.env.local` has `RAPID_API_KEY=your_key`
2. Or set `APIJOBS_API_KEY` if using APIJobs
3. Restart terminal/process after adding env vars

### Issue: "Missing Supabase environment variables"

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is set
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Check `.env.local` file exists in project root

### Issue: "No jobs found from API"

**Possible Causes**:
- API rate limit exceeded
- Invalid API key
- Query too specific (no results)

**Solution**:
1. Check API key is valid
2. Try a broader query
3. Check API provider dashboard for rate limits
4. Wait if rate limited

### Issue: "Error inserting job" (duplicate key)

**Note**: The script handles duplicates automatically by checking for existing jobs. If you see this error, it might indicate:
- Database constraint issue
- Race condition (unlikely with sequential processing)

**Solution**: The script should handle this automatically. If errors persist, check database logs.

## Best Practices

1. **Start with Dry Run**: Always test with `--dry-run` first
2. **Limit Results**: Use `--limit` to control how many jobs to fetch (start small)
3. **Monitor API Usage**: Check your API provider dashboard for rate limits
4. **Schedule Regular Syncs**: Set up a cron job to sync jobs periodically
5. **Review Transformed Data**: Check the dry-run output to ensure data mapping is correct

## Scheduling Regular Syncs

### Option 1: Vercel Cron Jobs

Create `vercel.json` cron configuration:

```json
{
  "crons": [{
    "path": "/api/cron/sync-jobs",
    "schedule": "0 */6 * * *"
  }]
}
```

Then create an API route that calls the sync script.

### Option 2: GitHub Actions

Create `.github/workflows/sync-jobs.yml`:

```yaml
name: Sync Jobs
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run sync:jobs -- --api=jsearch --query="software engineer" --limit=50
        env:
          RAPID_API_KEY: ${{ secrets.RAPID_API_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Option 3: Local Cron (Development)

```bash
# Add to crontab (crontab -e)
0 */6 * * * cd /path/to/project && npm run sync:jobs -- --api=jsearch --query="software engineer" >> /tmp/job-sync.log 2>&1
```

## Output Example

```
🚀 Job Sync from External API
==================================================
API Provider: jsearch
Query: AI engineer
Remote only: true
Limit: 50
Dry run: No
==================================================
📡 Fetching jobs from JSearch API...
   Query: AI engineer
   Remote only: true
✅ Fetched 50 jobs from JSearch API

🔄 Transforming 50 jobs...
✅ Transformed 48 jobs (2 skipped)

💾 Upserting 48 jobs to database...

✅ Inserted: Senior AI Engineer at Tech Corp
✅ Inserted: Machine Learning Engineer at AI Startup
🔄 Updated: AI Developer at Big Tech
...

==================================================
📊 Sync Summary
==================================================
Total fetched: 50
Valid jobs: 48
Inserted: 42
Updated: 6
Errors: 0
==================================================
```

## Related Documentation

- [Job APIs and API Keys Setup](./JOB_APIS_AND_API_KEYS.md)
- [APIJobs Testing Guide](./APIJOBS_TESTING.md)
- [Jobs API Fix](./JOBS_API_FIX.md)
