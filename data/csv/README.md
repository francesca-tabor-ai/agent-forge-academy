# CSV Import Folder

This folder is for storing CSV files that you want to import into Supabase.

## Usage

1. **Add your CSV files** to this folder
2. **Run the migration script** to import them into Supabase

## Migration Script

Use the migration script to import CSV files into Supabase:

```bash
# Import a specific CSV file to a specific table
tsx scripts/migrate-csv.ts <csv-file> <table-name>

# Example: Import users.csv into the profiles table
tsx scripts/migrate-csv.ts data/csv/users.csv profiles

# Example: Import courses.csv into the courses table
tsx scripts/migrate-csv.ts data/csv/courses.csv courses
```

## CSV Format Requirements

- **First row must be headers** (column names)
- **Column names must match** the Supabase table column names (case-sensitive)
- **Quoted values** are supported (e.g., `"value, with comma"`)
- **Empty values** will be treated as `NULL`

## Supported Operations

The migration script supports:

- **Upsert**: If the table has a unique constraint, duplicate rows will be updated
- **Batch processing**: Processes rows in batches of 100 for efficiency
- **Error handling**: Continues processing even if some rows fail, and reports all errors

## Table-Specific Notes

### Common Tables

- **profiles**: Requires `user_id` (must exist in `auth.users`)
- **courses**: Uses `slug` as unique identifier
- **student_profiles**: Requires `profile_id` (must exist in `profiles`)
- **jobs**: Can be imported directly
- **offers**: Can be imported directly

### Foreign Key Requirements

If your CSV references other tables (via foreign keys), make sure those records exist first:

- `profile_id` → must exist in `profiles`
- `course_id` → must exist in `courses`
- `student_profile_id` → must exist in `student_profiles`
- `user_id` → must exist in `auth.users`

## Example CSV Files

### profiles.csv
```csv
user_id,full_name,role,created_at
00000000-0000-0000-0000-000000000001,John Doe,student,2024-01-01T00:00:00Z
00000000-0000-0000-0000-000000000002,Jane Smith,recruiter,2024-01-02T00:00:00Z
```

### courses.csv
```csv
slug,title,description,duration_weeks,difficulty_level,is_published
prompt-engineering,Prompt Engineering,Learn to write effective prompts,4,beginner,true
multi-agent-systems,Multi-Agent Systems,Build complex AI systems,8,intermediate,true
```

## Environment Variables

Make sure you have these environment variables set in your `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env` file exists and has the required variables
- Make sure you're running the script from the project root

### "Table not found"
- Verify the table name matches exactly (case-sensitive)
- Check that the table exists in your Supabase database

### "Foreign key constraint violation"
- Ensure referenced records exist in the parent table
- Import parent tables first (e.g., `profiles` before `student_profiles`)

### "Column not found"
- Verify CSV headers match table column names exactly
- Check for typos or extra spaces in column names

## Alternative: Using Admin Bulk Upload API

If you prefer to use the web interface, you can also use the admin bulk upload API at `/api/admin/bulk-upload/apply`. This supports:
- Courses
- Subscriptions
- Entitlements

See `app/api/admin/bulk-upload/apply/route.ts` for more details.
