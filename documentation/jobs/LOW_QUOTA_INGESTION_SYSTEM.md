# Low-Quota Job Ingestion System

Production-safe job ingestion system designed for APIs with strict quota limits (5 requests/day, 50 requests/month).

## Overview

This system maximizes job freshness while minimizing API usage through:
- **Cron-based scheduling**: Runs 3-4 times per week
- **Role cluster rotation**: Rotates through 5 broad AI/tech role clusters
- **Single request per run**: Exactly 1 API call per cron execution
- **Aggressive deduplication**: Fingerprint-based deduplication prevents duplicates
- **Post-processing classification**: Rules-based job classification (no API calls)
- **Quota protection**: Hard stop at 45 requests/month with alerts
- **No-op safeguard**: Skips runs when previous run had < 3 new jobs

## Architecture

### Database Schema

#### Jobs Table Extensions
- `external_job_id` (VARCHAR): Optional ID from external API
- `job_fingerprint` (VARCHAR(64)): SHA-256 hash of normalized title+company+location
- `first_seen_at` (TIMESTAMPTZ): When job was first ingested
- `last_seen_at` (TIMESTAMPTZ): When job was last seen (updated on re-ingestion)
- `source_cluster` (VARCHAR(50)): Which role cluster fetched this job

#### Job Ingestion State Table
Single-row table tracking:
- `current_cluster_index`: Current position in rotation (0-4)
- `monthly_request_count`: Requests made this month
- `monthly_reset_date`: Date when counter resets
- `last_run_at`: Timestamp of last run
- `last_run_cluster`: Cluster used in last run
- `last_run_new_jobs_count`: Number of new jobs from last run
- `should_skip_next_run`: Flag to skip next run (low yield)

#### Job Ingestion Runs Table
Logs every run with:
- `run_at`: When the run occurred
- `cluster_name`: Which cluster was used
- `query_used`: The search query
- `api_requests_made`: Always 1
- `jobs_fetched`: Jobs returned from API
- `jobs_new`: New jobs inserted
- `jobs_updated`: Existing jobs updated
- `jobs_errors`: Errors encountered
- `monthly_request_count_after`: Quota count after run
- `was_skipped`: Whether run was skipped
- `skip_reason`: Reason for skipping (if applicable)

### Role Clusters

Five broad role clusters rotate on each run:

1. **core_ai**: `(AI Engineer OR Machine Learning OR LLM OR Applied AI)`
2. **agents_automation**: `(AI Agent OR Autonomous Agent OR Workflow Automation OR RPA)`
3. **data_mlops**: `(Data Scientist OR Data Engineer OR MLOps OR ML Platform)`
4. **product_research**: `(AI Product Manager OR Research Scientist OR AI Researcher)`
5. **commercial_leadership**: `(AI Sales OR Solutions Engineer OR Head of AI OR VP AI)`

### Cron Schedule

Runs on **Monday, Wednesday, Friday at 06:00 UTC** (3 times per week).

Optional: Saturday run only if prior week had >10 new jobs (not yet implemented).

## Process Flow

### 1. Cron Execution

```
GET /api/cron/fetch-jobs
Headers: Authorization: Bearer <CRON_SECRET>
```

### 2. Quota Check

- Check monthly request count
- Hard stop if ≥ 45 requests/month
- Alert if ≥ 36 requests/month (80% threshold)
- Auto-reset on new month

### 3. No-Op Safeguard

- Check if previous run had < 3 new jobs
- If yes, skip this run and log skip reason
- Clear skip flag after skipping once

### 4. Cluster Selection

- Get next cluster in rotation (round-robin)
- Advance rotation index for next run

### 5. API Request

- Make exactly **ONE** API request with:
  - Broad cluster query
  - Limit: 100 jobs
  - Date filter: Last 72 hours (if supported)
  - No per-role, per-location, or per-seniority filters

### 6. Job Processing

For each job:
1. **Normalize**: Title, company, location
2. **Fingerprint**: Generate SHA-256 hash
3. **Transform**: Map to database schema
4. **Deduplicate**: Check fingerprint in database
   - If exists: Update `last_seen_at`, preserve `first_seen_at`
   - If new: Insert with `first_seen_at` and `last_seen_at`

### 7. Classification (Post-Processing)

Rules-based classification (no API calls):
- **agents_automation**: Contains "agent", "autonomous", "workflow automation"
- **ai_ml**: Contains "LLM", "GenAI", "generative", "transformer"
- **mlops_infra**: Contains "MLOps", "ML platform", "model deployment"
- **data_mlops**: Contains "data scientist", "data engineer"
- **product_research**: Contains "product manager", "research scientist"
- **commercial_leadership**: Contains "sales", "solutions engineer", "head of AI"
- **core_ai**: Fallback for other AI/ML roles

Priority boost (1-5):
- Priority 5: "agent", "autonomous", "LLM", "GenAI"
- Priority 4: "machine learning", "deep learning"
- Priority 3: Default
- Priority 2: Generic AI roles

### 8. State Update

- Increment monthly request count
- Update cluster rotation index
- Set skip flag if < 3 new jobs
- Log run to `job_ingestion_runs`

## Quota Management

### Limits
- **Daily**: 5 requests/day (enforced by schedule: 3 runs/week)
- **Monthly**: 50 requests/month (hard stop at 45)

### Protection Mechanisms

1. **Hard Stop**: System refuses to run if monthly count ≥ 45
2. **Alert Threshold**: Logs warning at 36 requests (80%)
3. **Auto-Reset**: Counter resets on new month
4. **No-Op Safeguard**: Skips runs when yield is low

### Expected Usage

- **3 runs/week** × **4 weeks** = **12 requests/month**
- Well below 45/month limit
- Leaves buffer for manual runs or adjustments

## API Configuration

### Environment Variables

```bash
# Required
APIJOBS_API_KEY=your_api_key_here
CRON_SECRET=your_cron_secret_here

# Database (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### API Provider

Currently configured for **APIJobs API**:
- Endpoint: `https://api.apijobs.dev/v1/jobs`
- Auth: Bearer token
- Rate Limit: 50 requests/month (free tier)

## Monitoring

### Run Logs

Check `job_ingestion_runs` table for:
- Run history
- Success/failure rates
- Job counts per run
- Quota usage

### State Monitoring

Check `job_ingestion_state` table for:
- Current cluster rotation
- Monthly request count
- Last run statistics
- Skip flags

### Alerts

System logs warnings when:
- Approaching quota limit (≥ 36 requests)
- Low yield detected (< 3 new jobs)
- API errors occur
- Quota exceeded

## Manual Override

### Trigger Manual Run

```bash
curl -X GET "https://your-domain.com/api/cron/fetch-jobs" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**⚠️ Warning**: Manual runs count toward monthly quota!

### Reset State (Admin Only)

```sql
-- Reset monthly counter (use with caution)
UPDATE job_ingestion_state
SET monthly_request_count = 0,
    monthly_reset_date = CURRENT_DATE
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Clear skip flag
UPDATE job_ingestion_state
SET should_skip_next_run = false
WHERE id = '00000000-0000-0000-0000-000000000000';
```

## Success Criteria

The system is working correctly if:

✅ **≤ 15 API calls/month** (target: 12)
✅ **Jobs are < 3-4 days old** (72-hour filter)
✅ **No duplicates** (fingerprint deduplication)
✅ **Roles correctly classified** (rules-based)
✅ **System runs unattended** (cron automation)

## Troubleshooting

### Issue: "Monthly quota exceeded"

**Cause**: System has made ≥ 45 requests this month

**Solution**:
1. Wait for next month (auto-reset)
2. Or manually reset counter (admin only, see above)

### Issue: Runs being skipped

**Cause**: Previous run had < 3 new jobs

**Solution**:
- This is expected behavior (no-op safeguard)
- System will resume on next scheduled run
- Check if API is returning stale results

### Issue: No jobs being fetched

**Possible Causes**:
1. API key invalid/expired
2. API rate limit exceeded
3. Query too specific (no results)
4. Date filter too restrictive

**Solution**:
1. Verify `APIJOBS_API_KEY` is set correctly
2. Check API provider dashboard for rate limits
3. Review query in `job_ingestion_runs` table
4. Check API response in logs

### Issue: Duplicate jobs appearing

**Cause**: Fingerprint generation issue or migration not run

**Solution**:
1. Ensure migration `20250120000001_add_job_ingestion_tracking.sql` has run
2. Verify `job_fingerprint` column exists and is populated
3. Check fingerprint generation logic in `lib/jobs/ingestion-utils.ts`

## Future Enhancements

### Optional Features (Not Yet Implemented)

1. **Saturday Run Condition**: Only run Saturday if prior week had >10 new jobs
2. **Priority Boost**: Boost jobs with "Agent", "LLM", "Autonomous" keywords
3. **Manual Override UI**: Admin interface to trigger runs
4. **Event-Based Runs**: Trigger on funding announcements, conferences
5. **LLM Classification**: Optional LLM-based classification (post-processing only)

## Related Files

- **Migration**: `supabase/migrations/20250120000001_add_job_ingestion_tracking.sql`
- **Cron Endpoint**: `app/api/cron/fetch-jobs/route.ts`
- **Utilities**: `lib/jobs/ingestion-utils.ts`
- **Cron Config**: `vercel.json`

## API Documentation

See [JOB_APIS_AND_API_KEYS.md](./JOB_APIS_AND_API_KEYS.md) for API setup and key configuration.
