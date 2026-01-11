-- Optional reset script
-- WARNING: This will delete all data from seed tables
-- Use with caution! Only run in development/staging environments
-- 
-- This script truncates tables in dependency order to avoid foreign key violations
-- It does NOT reset sequences or drop tables - only clears data

-- Disable foreign key checks temporarily (PostgreSQL doesn't support this directly,
-- so we'll use TRUNCATE CASCADE which handles dependencies)

BEGIN;

-- Truncate tables in reverse dependency order
-- Start with tables that have foreign keys pointing to them

-- Clear event-related data
TRUNCATE TABLE event_attendance CASCADE;
TRUNCATE TABLE event_presentations CASCADE;
TRUNCATE TABLE events CASCADE;

-- Clear job and offer related data
TRUNCATE TABLE saved_offers CASCADE;
TRUNCATE TABLE offers CASCADE;
TRUNCATE TABLE jobs CASCADE;

-- Clear course-related data
TRUNCATE TABLE course_enrollments CASCADE;
TRUNCATE TABLE courses CASCADE;

-- Clear portfolio and student data (be careful - this deletes user data!)
-- TRUNCATE TABLE portfolio_projects CASCADE;
-- TRUNCATE TABLE student_profiles CASCADE;

-- Clear subscription plans (but keep subscriptions and payments for audit)
-- TRUNCATE TABLE subscription_plans CASCADE;

-- Note: We do NOT truncate:
-- - profiles (linked to auth.users)
-- - student_profiles (user data)
-- - subscriptions (payment data)
-- - payments (audit trail)
-- - stripe_customers (linked to auth.users)

COMMIT;

-- Reset sequences if needed (optional)
-- ALTER SEQUENCE courses_id_seq RESTART WITH 1;
-- ALTER SEQUENCE events_id_seq RESTART WITH 1;
-- etc.
