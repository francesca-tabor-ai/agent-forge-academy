# Cursor Prompt: Generate Seed SQL Scripts

## Quick Start

1. Run schema discovery to get your table/column/FK dump:
   ```bash
   ./scripts/discover-schema.sh
   ```

2. Copy the contents of `supabase/seed/SCHEMA_DISCOVERY.md` (or run the queries manually)

3. Paste the prompt below into Cursor Chat and attach your schema dump

---

## Cursor Chat Prompt

```
Given these tables + columns + foreign keys, generate SQL seed scripts that insert 10–50 rows per table, in dependency order, using gen_random_uuid() for uuid PKs, generate_series() for bulk rows, and believable dummy values. Ensure FK references are valid (select existing parent ids). Output as 5 files: 01_seed_core.sql…99_verify.sql.

Requirements:
- Use dependency order based on foreign key relationships
- Insert 10-50 rows per table (adjust based on table importance)
- Use gen_random_uuid() for UUID primary keys
- Use generate_series() for bulk row generation
- Generate believable dummy values (realistic names, emails, descriptions, etc.)
- Ensure foreign key references are valid (use SELECT to get existing parent IDs)
- Use ON CONFLICT clauses where appropriate for idempotency
- Include BEGIN/COMMIT transaction blocks
- Add comments explaining what each script seeds
- Create 99_verify.sql with simple count queries for all seeded tables

Output format:
- 01_seed_core.sql - Core data with no dependencies (subscription_plans, etc.)
- 02_seed_content.sql - Content data (courses, etc.)
- 03_seed_events.sql - Events data
- 04_seed_jobs_offers.sql - Jobs and offers
- 99_verify.sql - Verification with counts: SELECT 'table' AS table, count(*) FROM public.table UNION ALL...

[Paste your schema dump here - tables, columns, and foreign keys]
```

---

## Alternative: More Detailed Prompt

If you want more control over the output, use this expanded prompt:

```
Given these tables + columns + foreign keys, generate comprehensive SQL seed scripts with the following specifications:

1. **Dependency Order**: Organize scripts by foreign key dependencies
   - Start with tables that have no dependencies
   - Then tables that depend on those, etc.

2. **Row Counts**: 
   - Core tables (subscription_plans, etc.): 4-10 rows
   - Content tables (courses): 20-30 rows
   - User-dependent tables: 10-50 rows (with comments noting they require existing users)
   - Reference tables: 5-15 rows

3. **UUID Generation**: Use gen_random_uuid() for all UUID primary keys

4. **Bulk Generation**: Use generate_series() for creating multiple rows efficiently

5. **Realistic Data**:
   - Names: Use realistic first/last name combinations
   - Emails: Use realistic email patterns (firstname.lastname@example.com)
   - Descriptions: Use meaningful, varied descriptions
   - Dates: Use realistic date ranges (past 30-90 days for created_at)
   - Enums: Vary enum values appropriately

6. **Foreign Key Handling**:
   - Use lateral joins or subqueries to select existing parent IDs
   - Example: `join lateral (select id from parent_table order by random() limit 1) p on true`
   - Ensure references are valid before inserting

7. **Idempotency**: Use ON CONFLICT clauses for unique constraints

8. **Transaction Safety**: Wrap each script in BEGIN/COMMIT

9. **Output Files**:
   - 01_seed_core.sql - Core independent data
   - 02_seed_content.sql - Content data
   - 03_seed_events.sql - Events
   - 04_seed_jobs_offers.sql - Jobs and offers
   - 99_verify.sql - Simple count verification

10. **Comments**: Add clear comments explaining what each script does and any dependencies

[Paste your schema dump here]
```

---

## Schema Dump Queries

If you need to generate the schema dump, run these queries:

```sql
-- Tables and columns
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public'
order by table_name, ordinal_position;

-- Foreign keys
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as references_table,
  ccu.column_name as references_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
order by tc.table_name;
```

Or use the discovery script:
```bash
./scripts/discover-schema.sh
```

---

## Tips

1. **Attach Files**: In Cursor Chat, attach `supabase/seed/SCHEMA_DISCOVERY.md` if it exists
2. **Be Specific**: Mention your specific tables if you want certain ones prioritized
3. **Adjust Counts**: Specify if you want more/fewer rows for specific tables
4. **Review Output**: Always review generated SQL before running
5. **Test Incrementally**: Run scripts one at a time and verify with 99_verify.sql

---

## Example Usage

1. Generate schema dump:
   ```bash
   ./scripts/discover-schema.sh
   ```

2. Open Cursor Chat

3. Copy the prompt from above

4. Attach `supabase/seed/SCHEMA_DISCOVERY.md` or paste the schema dump

5. Review and adapt the generated scripts

6. Run the scripts:
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/seed/01_seed_core.sql
   psql "$SUPABASE_DB_URL" -f supabase/seed/02_seed_content.sql
   # etc.
   ```
