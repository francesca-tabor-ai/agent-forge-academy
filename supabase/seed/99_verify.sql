-- Verification script: Check that seed data was inserted correctly
-- Run this after all seed scripts to verify data integrity
-- Usage: psql "$SUPABASE_DB_URL" -f supabase/seed/99_verify.sql

-- Check tables that SHOULD have data (from seed files with actual INSERTs)
SELECT '=== TABLES WITH SEED DATA ===' AS section;

SELECT 'subscription_plans' AS table_name, count(*) AS record_count FROM public.subscription_plans
UNION ALL SELECT 'courses', count(*) FROM public.courses
UNION ALL SELECT 'events', count(*) FROM public.events
UNION ALL SELECT 'jobs', count(*) FROM public.jobs
UNION ALL SELECT 'offers', count(*) FROM public.offers
ORDER BY table_name;

-- Check tables that REQUIRE USER DATA (won't have data unless you have auth.users)
SELECT '' AS blank_line;
SELECT '=== TABLES REQUIRING USER DATA (will be empty without auth.users) ===' AS section;

SELECT 'profiles' AS table_name, count(*) AS record_count FROM public.profiles
UNION ALL SELECT 'student_profiles', count(*) FROM public.student_profiles
UNION ALL SELECT 'recruiter_profiles', count(*) FROM public.recruiter_profiles
UNION ALL SELECT 'portfolio_projects', count(*) FROM public.portfolio_projects
UNION ALL SELECT 'questions', count(*) FROM public.questions
UNION ALL SELECT 'course_enrollments', count(*) FROM public.course_enrollments
UNION ALL SELECT 'payments', count(*) FROM public.payments
ORDER BY table_name;

-- Check if auth.users exist (this requires superuser access)
SELECT '' AS blank_line;
SELECT '=== AUTH.USERS CHECK ===' AS section;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN (SELECT count(*)::text FROM auth.users)
    ELSE 'Cannot access auth.users (requires superuser or service role)'
  END AS auth_users_count;

-- Detailed checks for seeded tables
SELECT '' AS blank_line;
SELECT '=== DETAILED CHECKS ===' AS section;

-- Check subscription_plans
SELECT 'subscription_plans' AS table_name, 
       count(*) AS total,
       count(*) FILTER (WHERE active = true) AS active_count,
       count(*) FILTER (WHERE active = false) AS inactive_count
FROM public.subscription_plans;

-- Check courses
SELECT 'courses' AS table_name,
       count(*) AS total,
       count(*) FILTER (WHERE is_published = true) AS published_count,
       count(*) FILTER (WHERE is_published = false) AS unpublished_count
FROM public.courses;

-- Check events
SELECT 'events' AS table_name,
       count(*) AS total,
       count(*) FILTER (WHERE event_type = 'demo_day') AS demo_days,
       count(*) FILTER (WHERE event_type = 'workshop') AS workshops,
       count(*) FILTER (WHERE event_type = 'networking') AS networking,
       count(*) FILTER (WHERE start_time > NOW()) AS future_events,
       count(*) FILTER (WHERE start_time <= NOW()) AS past_events
FROM public.events;

-- Check jobs
SELECT 'jobs' AS table_name,
       count(*) AS total,
       count(*) FILTER (WHERE is_active = true) AS active_jobs,
       count(*) FILTER (WHERE is_featured = true) AS featured_jobs,
       count(*) FILTER (WHERE status = 'recommended') AS recommended_jobs
FROM public.jobs;

-- Check offers
SELECT 'offers' AS table_name,
       count(*) AS total,
       count(*) FILTER (WHERE is_active = true) AS active_offers,
       count(*) FILTER (WHERE is_recommended = true) AS recommended_offers,
       count(*) FILTER (WHERE expiration_date > NOW()) AS not_expired
FROM public.offers;

-- Sample data from each seeded table
SELECT '' AS blank_line;
SELECT '=== SAMPLE DATA ===' AS section;

SELECT 'subscription_plans (first 3)' AS sample_table;
SELECT id, name, interval, active FROM public.subscription_plans LIMIT 3;

SELECT '' AS blank_line;
SELECT 'courses (first 3)' AS sample_table;
SELECT slug, title, difficulty_level, is_published FROM public.courses LIMIT 3;

SELECT '' AS blank_line;
SELECT 'events (first 3)' AS sample_table;
SELECT title, event_type, start_time FROM public.events ORDER BY start_time LIMIT 3;

SELECT '' AS blank_line;
SELECT 'jobs (first 3)' AS sample_table;
SELECT title, company, status, is_active FROM public.jobs LIMIT 3;

SELECT '' AS blank_line;
SELECT 'offers (first 3)' AS sample_table;
SELECT title, provider, discount_text, is_active FROM public.offers LIMIT 3;
