# Email System Implementation Checklist (Fast Path)

This document outlines the fast path for implementing the weekly email system, in order of priority.

## ✅ Implementation Status

### 1. ✅ Add Columns + Unsubscribe Token
**Status:** COMPLETE
- **Migration:** `20250115000002_add_email_preferences_to_student_profiles.sql`
- **Migration:** `20250115000004_update_email_preferences_add_jobs.sql`
- **Columns added:**
  - `weekly_learning_emails_enabled` (boolean, default true)
  - `weekly_jobs_emails_enabled` (boolean, default true)
  - `weekly_email_day` (integer, 0-6, default 2)
  - `weekly_email_hour` (integer, 0-23, default 9)
  - `unsubscribe_token` (text, unique, auto-generated)
- **Features:**
  - Auto-generation of unsubscribe tokens via trigger
  - Backfill for existing profiles

### 2. ✅ Add Unsubscribe Route
**Status:** COMPLETE
- **File:** `app/api/email/unsubscribe/route.ts`
- **Endpoint:** `GET /api/email/unsubscribe?token=...&type=learning|jobs|all`
- **Features:**
  - Type-specific unsubscribes (learning, jobs, or all)
  - Redirects to confirmation page
  - Handles already-unsubscribed cases
  - Updates `weekly_learning_emails_enabled` and/or `weekly_jobs_emails_enabled`

### 3. ✅ Add Email Outbox + Dedupe
**Status:** COMPLETE
- **Migration:** `20250115000003_create_email_outbox_table.sql`
- **Migration:** `20250115000005_update_email_outbox_structure.sql`
- **Table:** `email_outbox`
- **Key fields:**
  - `email_type` (weekly_learning | weekly_jobs)
  - `dedupe_key` (unique, format: `email_type:YYYY-WW:student_profile_id`)
  - `to_email`, `subject`, `payload` (JSONB)
  - `status` (queued | sent | failed)
  - `attempt_count`, `next_attempt_at`, `last_error`
- **Features:**
  - Safe deduplication via unique `dedupe_key`
  - Retry mechanism with exponential backoff
  - Weekly format (YYYY-WW) allows safe re-runs within same week

### 4. ✅ Add Jobs Weekly Cron + Basic Template
**Status:** COMPLETE
- **Endpoint:** `GET /api/cron/weekly-jobs-emails`
- **File:** `app/api/cron/weekly-jobs-emails/route.ts`
- **Template:** `lib/email/templates.ts` → `renderWeeklyJobsEmailHTML()` and `renderWeeklyJobsEmailText()`
- **Features:**
  - Finds students with `weekly_jobs_emails_enabled = true`
  - Calculates job matches using existing matching algorithm
  - Selects top 3 roles (status: recommended/unlocked/new, sorted by matching_score desc)
  - Computes common missing skill
  - Enqueues to `email_outbox` with dedupe key

### 5. ✅ Add Email Takeaway to Top Course Lessons
**Status:** COMPLETE
- **Courses updated:**
  - `multi-agent-systems` (11 modules)
  - `vibe-coding-cursor-supabase` (8 modules)
- **Frontmatter fields added:**
  - `email_takeaway`: One sentence insight that sells the next lesson
  - `email_action`: 3-5 minute actionable task (optional but powerful)
- **Fallback logic:**
  - `email_takeaway` falls back to `description` if not present
  - `email_action` falls back to course-specific default or generic template

## 📋 Fast Path Implementation Order

If building from scratch, follow this order:

### Phase 1: Foundation (Required)
1. **Add email preference columns** to `student_profiles`
   - `weekly_learning_emails_enabled`, `weekly_jobs_emails_enabled`
   - `unsubscribe_token` with auto-generation
   - Day/hour preferences

2. **Add unsubscribe endpoint**
   - `GET /api/email/unsubscribe?token=...&type=...`
   - Type-specific unsubscribes (learning/jobs/all)
   - Redirect to confirmation page

### Phase 2: Email Queue (Recommended)
3. **Create email_outbox table**
   - Fields: `email_type`, `dedupe_key`, `to_email`, `subject`, `payload`, `status`
   - Retry fields: `attempt_count`, `next_attempt_at`, `last_error`
   - Unique constraint on `dedupe_key`
   - RLS policies

### Phase 3: Email Generation
4. **Add weekly learning emails cron**
   - `GET /api/cron/weekly-learning-emails`
   - Finds students with enabled learning emails
   - Determines next lesson based on progress
   - Enqueues to `email_outbox`

5. **Add weekly jobs emails cron**
   - `GET /api/cron/weekly-jobs-emails`
   - Finds students with enabled jobs emails
   - Calculates job matches
   - Selects top 3 roles
   - Enqueues to `email_outbox`

### Phase 4: Email Sending
6. **Add email sender job**
   - `GET /api/cron/send-emails`
   - Processes queued emails
   - Retry logic with exponential backoff
   - Updates status (sent/failed)

### Phase 5: Content Enhancement (Over Time)
7. **Add email_takeaway to lesson frontmatter**
   - Start with top 1-2 courses
   - Add `email_takeaway` and `email_action` fields
   - Expand to other courses gradually

## 🔧 Additional Components (Already Implemented)

- **Email templates:** HTML and plain text rendering
- **Email sending module:** Resend integration with unsubscribe links
- **Preferences UI:** `/student/settings/notifications` page
- **Combined cron endpoint:** `/api/cron/weekly-emails` (runs both types)
- **Preference checks:** Safety checks in email sender to respect preferences

## 📝 Environment Variables Required

```bash
# Email provider
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Cron security
CRON_SECRET=your_cron_secret

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Company info (optional, for email footer compliance)
COMPANY_NAME=Agent Forge Academy
COMPANY_ADDRESS=London, UK
```

## 🚀 Quick Start

1. Run migrations:
   ```bash
   supabase db push
   ```

2. Set environment variables (see above)

3. Test cron endpoints:
   ```bash
   curl -X GET "https://your-domain.com/api/cron/weekly-learning-emails" \
     -H "Authorization: Bearer $CRON_SECRET"
   
   curl -X GET "https://your-domain.com/api/cron/weekly-jobs-emails" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

4. Set up cron job (weekly):
   ```bash
   # Option 1: Combined endpoint
   curl -X GET "https://your-domain.com/api/cron/weekly-emails" \
     -H "Authorization: Bearer $CRON_SECRET"
   
   # Option 2: Separate endpoints
   # Call both on the same schedule
   ```

5. Process email queue (run frequently, e.g., every 5 minutes):
   ```bash
   curl -X GET "https://your-domain.com/api/cron/send-emails" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

## ✅ All Components Complete

All fast path components have been implemented and are ready for use!
