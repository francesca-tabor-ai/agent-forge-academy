# Setting Up Environment Variables

## Quick Setup

You need to create a `.env` file in the project root with your Supabase database connection string.

### Step 1: Get Your Supabase Connection String

1. Go to your **Supabase Dashboard**
2. Select your project
3. Go to **Project Settings** → **Database**
4. Scroll down to **Connection string**
5. Copy one of these:
   - **Direct connection** (port 5432) - Recommended for seeding
   - **Transaction pooler** (port 6543) - Alternative option

The connection string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

Or for the transaction pooler:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Step 2: Create `.env` File

Create a file named `.env` in the project root:

```bash
# In the project root directory
touch .env
```

Then add your connection string:

```bash
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

**Important:** Replace:
- `[YOUR-PASSWORD]` with your actual database password
- `[PROJECT-REF]` with your project reference ID
- `[REGION]` with your region (if using pooler)

### Step 3: Load Environment Variables

**Option A: Use the run-seeds.sh script (automatically loads .env)**
```bash
./scripts/run-seeds.sh
```

**Option B: Manually load before running commands**
```bash
# Load environment variables
export $(grep -v '^#' .env | xargs)

# Then run your commands
psql "$SUPABASE_DB_URL" -f supabase/seed/01_seed_core.sql
```

**Option C: Inline (for one-time use)**
```bash
psql "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" -f supabase/seed/01_seed_core.sql
```

## Required Environment Variables for Next.js App

For the Next.js application, you need these environment variables in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Storage Bucket Configuration (Optional)
# Defaults to 'resumes' if not set
NEXT_PUBLIC_SUPABASE_RESUME_BUCKET=resumes
```

### Storage Bucket Setup

1. Go to Supabase Dashboard → Storage
2. Create a bucket named `resumes` (or your custom name)
3. Set bucket to **Private** (recommended for CVs)
4. Set the `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` env var to match

**Important:** The bucket name must match between your Supabase project and the environment variable, or uploads will fail with "Bucket not found".

## Security Note

⚠️ **Never commit your `.env` or `.env.local` file to git!** It contains sensitive credentials.

The `.env` file should already be in `.gitignore`. Verify:
```bash
grep -q "\.env" .gitignore && echo "✅ .env is in .gitignore" || echo "❌ Add .env to .gitignore"
```

## Troubleshooting

### Error: "database does not exist"
- You're connecting to a local PostgreSQL instead of Supabase
- Make sure `SUPABASE_DB_URL` is set and exported
- Verify the connection string is correct

### Error: "password authentication failed"
- Check that your password is correct
- Make sure you're using the database password (not your Supabase account password)
- You can reset the database password in: Supabase Dashboard → Project Settings → Database

### Error: "connection refused"
- Check your network connection
- Verify the connection string format
- Make sure your IP is allowed (if IP restrictions are enabled)

### Finding Your Database Password

If you don't know your database password:
1. Go to Supabase Dashboard → Project Settings → Database
2. Look for "Database password" section
3. Click "Reset database password" if needed
4. Copy the new password and update your `.env` file
