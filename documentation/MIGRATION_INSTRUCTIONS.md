# Running Supabase Migrations - Step by Step Guide

## Prerequisites
- Supabase CLI installed ✅ (v2.67.1)
- Access to your Supabase project dashboard

## Step 1: Login to Supabase CLI

Run this command in your terminal:

```bash
supabase login
```

This will:
- Open your browser to authenticate
- Ask you to sign in with your Supabase account
- Grant access to the CLI

**Alternative:** If browser doesn't open, you can use:
```bash
supabase login --token YOUR_ACCESS_TOKEN
```
(Get the token from: https://supabase.com/dashboard/account/tokens)

---

## Step 2: Link Your Project

You need to link your local project to your remote Supabase project.

### Find Your Project Reference ID:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Copy the **Reference ID** (it looks like: `abcdefghijklmnop`)

### Link the Project:

```bash
supabase link --project-ref YOUR_PROJECT_REF_ID
```

**Example:**
```bash
supabase link --project-ref abcdefghijklmnop
```

This will ask for your database password. You can find it in:
- **Settings** → **Database** → **Database password**

---

## Step 3: Push Migrations

Once linked, push all migrations to your database:

```bash
supabase db push
```

This will:
- Show you which migrations will be applied
- Ask for confirmation
- Run all pending migrations in order

**To see what will be pushed without applying:**
```bash
supabase db diff
```

---

## Step 4: Verify Migrations

After pushing, verify the jobs table was created:

```bash
supabase db remote list
```

Or check in your Supabase dashboard:
- Go to **Table Editor**
- You should see the `jobs` table with 15 sample jobs

---

## Troubleshooting

### If you get "project not linked" error:
```bash
# Check if project is linked
supabase status

# If not linked, run:
supabase link --project-ref YOUR_PROJECT_REF_ID
```

### If you get authentication errors:
```bash
# Re-login
supabase logout
supabase login
```

### If migrations fail:
```bash
# Check migration status
supabase migration list

# View specific migration
supabase migration list --db-url "postgresql://..."
```

### To reset and re-run all migrations (⚠️ DESTRUCTIVE):
```bash
# This will drop and recreate everything
supabase db reset
```

---

## Quick Reference Commands

```bash
# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Check status
supabase status

# View migrations
supabase migration list

# Open Supabase Studio (local only)
supabase studio
```

---

## What Gets Created

After running migrations, you'll have:

1. **jobs table** with columns:
   - id, title, company, description
   - job_type, experience_level, location
   - status, matching_score, skills
   - recommended_for_courses, external_url
   - and more...

2. **15 sample jobs** including:
   - Senior AI Engineer
   - AI Product Manager
   - ML Engineer
   - And 12 more...

3. **RLS policies** for:
   - Students can view active jobs
   - Admins can manage all jobs
