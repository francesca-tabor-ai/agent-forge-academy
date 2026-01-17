# Email System API Endpoints & Secrets

Complete reference for all API endpoints and required secrets to make the email system functional.

## 🔐 Required Secrets & Environment Variables

### Required (System Won't Work Without These)

```bash
# Email Provider (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
# Alternative: RESEND_FROM_EMAIL=noreply@yourdomain.com

# Cron Security
CRON_SECRET=your_secure_random_string_here
# Generate with: openssl rand -hex 32

# Application URL (for unsubscribe/preferences links)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional (For Compliance)

```bash
# Company Information (for email footer)
COMPANY_NAME=Agent Forge Academy
COMPANY_ADDRESS=London, UK
# Or full address: "123 Street, City, Country, Postal Code"
```

## 📡 API Endpoints

### Cron Endpoints (Protected by CRON_SECRET)

All cron endpoints require the `Authorization: Bearer <CRON_SECRET>` header.

#### 1. Weekly Learning Emails (Generate & Queue)
**Endpoint:** `GET /api/cron/weekly-learning-emails`

**Purpose:** Generates and enqueues weekly learning emails for students

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "message": "Weekly learning emails processed",
  "totalStudents": 150,
  "enqueued": 145,
  "errors": [] // Optional, only if errors occurred
}
```

**Schedule:** Weekly (e.g., Tuesday 9:00 AM)

**Example:**
```bash
curl -X GET "https://your-domain.com/api/cron/weekly-learning-emails" \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

#### 2. Weekly Jobs Emails (Generate & Queue)
**Endpoint:** `GET /api/cron/weekly-jobs-emails`

**Purpose:** Generates and enqueues weekly job opportunity emails for students

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "message": "Weekly jobs emails processed",
  "totalStudents": 120,
  "enqueued": 118,
  "errors": [] // Optional, only if errors occurred
}
```

**Schedule:** Weekly (e.g., Tuesday 9:00 AM, same as learning emails)

**Example:**
```bash
curl -X GET "https://your-domain.com/api/cron/weekly-jobs-emails" \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

#### 3. Combined Weekly Emails (Generate & Queue Both)
**Endpoint:** `GET /api/cron/weekly-emails`

**Purpose:** Convenience endpoint that runs both learning and jobs email generation in parallel

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "message": "Weekly emails processed",
  "learning": {
    "message": "Weekly learning emails processed",
    "totalStudents": 150,
    "enqueued": 145
  },
  "jobs": {
    "message": "Weekly jobs emails processed",
    "totalStudents": 120,
    "enqueued": 118
  },
  "success": true,
  "errors": [] // Optional, only if errors occurred
}
```

**Schedule:** Weekly (e.g., Tuesday 9:00 AM)

**Example:**
```bash
curl -X GET "https://your-domain.com/api/cron/weekly-emails" \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

#### 4. Send Emails (Process Queue)
**Endpoint:** `GET /api/cron/send-emails`

**Purpose:** Processes queued emails from `email_outbox` and sends them via Resend

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "message": "Email sending job completed",
  "processed": 50,
  "sent": 48,
  "failed": 2,
  "errors": [] // Optional, only if errors occurred
}
```

**Schedule:** Frequent (e.g., every 5 minutes)

**Features:**
- Processes up to 50 emails per run
- Retry logic with exponential backoff
- Updates status: `queued` → `sent` or `failed`

**Example:**
```bash
curl -X GET "https://your-domain.com/api/cron/send-emails" \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

### Public Endpoints (No Auth Required)

#### 5. Unsubscribe
**Endpoint:** `GET /api/email/unsubscribe?token=<unsubscribe_token>&type=<learning|jobs|all>`

**Purpose:** Allows users to unsubscribe from email types via email link

**Query Parameters:**
- `token` (required): Unsubscribe token from `student_profiles.unsubscribe_token`
- `type` (optional): `learning`, `jobs`, or `all` (default: `all`)

**Response:** Redirects to `/student/subscription?unsubscribed=success&type=<type>`

**Example:**
```
https://your-domain.com/api/email/unsubscribe?token=abc123&type=jobs
```

**Behavior:**
- `type=learning`: Sets `weekly_learning_emails_enabled=false`
- `type=jobs`: Sets `weekly_jobs_emails_enabled=false`
- `type=all`: Sets both to `false`

---

### Authenticated Endpoints (User Login Required)

#### 6. Email Preferences (Update)
**Endpoint:** `PATCH /api/email/preferences`

**Purpose:** Allows logged-in users to update their email preferences

**Headers:**
```
Authorization: Bearer <user_session_token>
Content-Type: application/json
```

**Body:**
```json
{
  "studentProfileId": "uuid",
  "weeklyLearningEmailsEnabled": true,
  "weeklyJobsEmailsEnabled": true,
  "weeklyEmailDay": 2,  // 0-6 (Sunday-Saturday)
  "weeklyEmailHour": 9  // 0-23 (24-hour format)
}
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    "id": "uuid",
    "weekly_learning_emails_enabled": true,
    "weekly_jobs_emails_enabled": true,
    "weekly_email_day": 2,
    "weekly_email_hour": 9
  }
}
```

---

#### 7. Email Preferences (View)
**Endpoint:** `GET /student/settings/notifications`

**Purpose:** UI page for users to view and manage email preferences

**Access:**
- Logged-in users: Direct access
- Via email link: `/student/settings/notifications?token=<unsubscribe_token>`

---

## 🔧 Setup Instructions

### 1. Generate CRON_SECRET

```bash
# Generate a secure random secret
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create a new API key
4. Copy the key (starts with `re_`)

### 3. Configure Email Domain

1. In Resend dashboard, add and verify your domain
2. Set up DNS records (SPF, DKIM, DMARC)
3. Use verified domain in `EMAIL_FROM` (e.g., `noreply@yourdomain.com`)

### 4. Set Environment Variables

**For local development (.env.local):**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
CRON_SECRET=your_generated_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
COMPANY_NAME=Agent Forge Academy
COMPANY_ADDRESS=London, UK
```

**For production (Vercel/Netlify/etc):**
- Add all variables in your hosting platform's environment variables section
- Ensure `NEXT_PUBLIC_APP_URL` points to your production domain

### 5. Set Up Cron Jobs

**Option A: Using Vercel Cron (if on Vercel)**

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-emails",
      "schedule": "0 9 * * 2"
    },
    {
      "path": "/api/cron/send-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Option B: Using External Cron Service**

**Weekly email generation (Tuesday 9:00 AM):**
```bash
# Using cron (Linux/Mac)
0 9 * * 2 curl -X GET "https://your-domain.com/api/cron/weekly-emails" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Email sending (every 5 minutes):**
```bash
# Using cron (Linux/Mac)
*/5 * * * * curl -X GET "https://your-domain.com/api/cron/send-emails" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Option C: Using GitHub Actions**

Create `.github/workflows/weekly-emails.yml`:
```yaml
name: Weekly Emails

on:
  schedule:
    - cron: '0 9 * * 2'  # Tuesday 9:00 AM UTC
  workflow_dispatch:

jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Weekly Emails
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/cron/weekly-emails" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## 🧪 Testing

### Test Cron Endpoints Locally

```bash
# Set CRON_SECRET in your .env.local
export CRON_SECRET=test_secret_123

# Test learning emails
curl -X GET "http://localhost:3000/api/cron/weekly-learning-emails" \
  -H "Authorization: Bearer $CRON_SECRET"

# Test jobs emails
curl -X GET "http://localhost:3000/api/cron/weekly-jobs-emails" \
  -H "Authorization: Bearer $CRON_SECRET"

# Test combined
curl -X GET "http://localhost:3000/api/cron/weekly-emails" \
  -H "Authorization: Bearer $CRON_SECRET"

# Test email sender
curl -X GET "http://localhost:3000/api/cron/send-emails" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Test Unsubscribe Link

1. Get an unsubscribe token from database:
   ```sql
   SELECT unsubscribe_token FROM student_profiles LIMIT 1;
   ```

2. Visit in browser:
   ```
   http://localhost:3000/api/email/unsubscribe?token=<token>&type=learning
   ```

## 📊 Monitoring

### Check Email Queue Status

```sql
-- View queued emails
SELECT email_type, status, COUNT(*) 
FROM email_outbox 
GROUP BY email_type, status;

-- View failed emails
SELECT * FROM email_outbox 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Email Preferences

```sql
-- View email preferences summary
SELECT 
  COUNT(*) FILTER (WHERE weekly_learning_emails_enabled = true) as learning_enabled,
  COUNT(*) FILTER (WHERE weekly_jobs_emails_enabled = true) as jobs_enabled,
  COUNT(*) as total_students
FROM student_profiles;
```

## 🔒 Security Notes

1. **CRON_SECRET**: Keep this secret! Never commit to git
2. **RESEND_API_KEY**: Treat as sensitive, use environment variables only
3. **Unsubscribe tokens**: Auto-generated, unique per student
4. **RLS Policies**: All database tables have Row Level Security enabled
5. **Cron endpoints**: Only accessible with correct `CRON_SECRET` header

## ✅ Checklist

- [ ] Set `RESEND_API_KEY` environment variable
- [ ] Set `EMAIL_FROM` environment variable (verified domain)
- [ ] Set `CRON_SECRET` environment variable (secure random string)
- [ ] Set `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Set `COMPANY_NAME` and `COMPANY_ADDRESS` (optional, for compliance)
- [ ] Run database migrations (`supabase db push`)
- [ ] Verify domain in Resend dashboard
- [ ] Set up cron job for weekly email generation
- [ ] Set up cron job for email sending (every 5 minutes)
- [ ] Test endpoints with curl or cron service
- [ ] Monitor email queue in database
