-- Verification script: Check that seed data was inserted correctly
-- Run this after all seed scripts to verify data integrity

BEGIN;

-- Verify subscription plans
DO $$
DECLARE
  plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count FROM subscription_plans;
  IF plan_count = 0 THEN
    RAISE WARNING 'No subscription plans found';
  ELSE
    RAISE NOTICE '✓ Found % subscription plans', plan_count;
  END IF;
END $$;

-- Verify courses
DO $$
DECLARE
  course_count INTEGER;
  published_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO course_count FROM courses;
  SELECT COUNT(*) INTO published_count FROM courses WHERE is_published = true;
  
  IF course_count = 0 THEN
    RAISE WARNING 'No courses found';
  ELSE
    RAISE NOTICE '✓ Found % courses (% published)', course_count, published_count;
  END IF;
END $$;

-- Verify events
DO $$
DECLARE
  event_count INTEGER;
  upcoming_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO event_count FROM events;
  SELECT COUNT(*) INTO upcoming_count FROM events WHERE start_time > NOW();
  
  IF event_count = 0 THEN
    RAISE WARNING 'No events found';
  ELSE
    RAISE NOTICE '✓ Found % events (% upcoming)', event_count, upcoming_count;
  END IF;
END $$;

-- Verify jobs
DO $$
DECLARE
  job_count INTEGER;
  active_count INTEGER;
  featured_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO job_count FROM jobs;
  SELECT COUNT(*) INTO active_count FROM jobs WHERE is_active = true;
  SELECT COUNT(*) INTO featured_count FROM jobs WHERE is_featured = true;
  
  IF job_count = 0 THEN
    RAISE WARNING 'No jobs found';
  ELSE
    RAISE NOTICE '✓ Found % jobs (% active, % featured)', job_count, active_count, featured_count;
  END IF;
END $$;

-- Verify offers
DO $$
DECLARE
  offer_count INTEGER;
  active_count INTEGER;
  recommended_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO offer_count FROM offers;
  SELECT COUNT(*) INTO active_count FROM offers WHERE is_active = true;
  SELECT COUNT(*) INTO recommended_count FROM offers WHERE is_recommended = true;
  
  IF offer_count = 0 THEN
    RAISE WARNING 'No offers found';
  ELSE
    RAISE NOTICE '✓ Found % offers (% active, % recommended)', offer_count, active_count, recommended_count;
  END IF;
END $$;

-- Display summary table
SELECT 
  'subscription_plans' AS table_name,
  COUNT(*) AS record_count
FROM subscription_plans
UNION ALL
SELECT 
  'courses' AS table_name,
  COUNT(*) AS record_count
FROM courses
UNION ALL
SELECT 
  'events' AS table_name,
  COUNT(*) AS record_count
FROM events
UNION ALL
SELECT 
  'jobs' AS table_name,
  COUNT(*) AS record_count
FROM jobs
UNION ALL
SELECT 
  'offers' AS table_name,
  COUNT(*) AS record_count
FROM offers
ORDER BY table_name;

COMMIT;
