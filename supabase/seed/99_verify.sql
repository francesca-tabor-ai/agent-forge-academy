-- Verification script: Check that seed data was inserted correctly
-- Run this after all seed scripts to verify data integrity
-- Usage: psql "$SUPABASE_DB_URL" -f supabase/seed/99_verify.sql

-- Simple count verification for all seeded tables
SELECT 'subscription_plans' AS table, count(*) AS count FROM public.subscription_plans
UNION ALL SELECT 'courses', count(*) FROM public.courses
UNION ALL SELECT 'events', count(*) FROM public.events
UNION ALL SELECT 'jobs', count(*) FROM public.jobs
UNION ALL SELECT 'offers', count(*) FROM public.offers
ORDER BY table;
