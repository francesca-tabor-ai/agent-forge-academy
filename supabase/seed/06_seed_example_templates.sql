-- Example seed templates adapted to actual schema
-- These are templates you can copy/paste and adapt using your column dump
-- NOTE: These use gen_random_uuid() - replace with hardcoded UUIDs for deterministic seeding
--
-- IMPORTANT: Run with direct database connection (psql) to bypass RLS

BEGIN;

-- ============================================================================
-- TEMPLATE 1: Seed profiles (1-20 users)
-- NOTE: Profiles depend on auth.users - you cannot seed these directly
-- This template shows the structure, but profiles must be created via auth signup
-- ============================================================================
/*
-- This won't work because profiles.user_id references auth.users(id)
-- Profiles are created automatically when users sign up via Supabase Auth
-- 
-- If you need test profiles, create auth users first, then:
insert into public.profiles (id, user_id, role, created_at, updated_at)
select
  gen_random_uuid(),
  au.id,  -- from auth.users
  case when row_number() over () % 3 = 0 then 'recruiter'::user_role 
       when row_number() over () % 3 = 1 then 'tutor'::user_role 
       else 'student'::user_role end,
  now() - ((row_number() over ()) || ' days')::interval,
  now() - ((row_number() over ()) || ' days')::interval
from auth.users au
limit 20;
*/

-- ============================================================================
-- TEMPLATE 2: Seed courses (5 courses with hardcoded UUIDs)
-- ============================================================================
-- Example: Add 5 more courses with generated data
/*
insert into public.courses (id, slug, title, description, duration_weeks, difficulty_level, is_published, created_at, updated_at)
select
  gen_random_uuid(),  -- Replace with hardcoded UUID for deterministic seeding
  'example-course-' || gs,
  'Example Course ' || gs,
  'Dummy description for example course ' || gs,
  (random() * 12 + 1)::int,  -- 1-12 weeks
  case when gs % 3 = 0 then 'beginner'
       when gs % 3 = 1 then 'intermediate'
       else 'advanced' end,
  true,
  now() - (gs || ' days')::interval,
  now() - (gs || ' days')::interval
from generate_series(1, 5) as gs
on conflict (slug) do nothing;
*/

-- ============================================================================
-- TEMPLATE 3: Seed course_enrollments (random enrollment)
-- Requires: existing courses and student_profiles
-- ============================================================================
-- Example: Enroll students in courses randomly
/*
insert into public.course_enrollments (id, course_id, student_profile_id, enrolled_at, completed_at, progress_percentage, created_at, updated_at)
select
  gen_random_uuid(),
  c.id,
  sp.id,
  now() - ((random() * 30)::int || ' days')::interval,
  case when random() < 0.2 then now() - ((random() * 10)::int || ' days')::interval else null end,  -- 20% completed
  (random() * 100)::int,  -- 0-100% progress
  now() - ((random() * 30)::int || ' days')::interval,
  now() - ((random() * 30)::int || ' days')::interval
from public.courses c
cross join lateral (
  select id from public.student_profiles order by random() limit 5
) sp
where c.is_published = true
on conflict (course_id, student_profile_id) do nothing;
*/

-- ============================================================================
-- TEMPLATE 4: Seed jobs (15 jobs with generated data)
-- ============================================================================
-- Example: Add more jobs with generated data
/*
insert into public.jobs (
  id, title, company, description, job_type, experience_level, location, is_remote,
  salary_range, status, matching_score, skills, skills_missing, recommended_for_courses,
  external_url, is_active, is_featured, created_at, updated_at
)
select
  gen_random_uuid(),  -- Replace with hardcoded UUID for deterministic seeding
  'Role ' || gs,
  case when gs % 2 = 0 then 'Acme Ltd' else 'Globex Corp' end,
  'Description for role ' || gs || '. This is a generated job listing for testing purposes.',
  case when gs % 4 = 0 then 'full_time'::job_type
       when gs % 4 = 1 then 'part_time'::job_type
       when gs % 4 = 2 then 'contract'::job_type
       else 'internship'::job_type end,
  case when gs % 5 = 0 then 'entry'::experience_level
       when gs % 5 = 1 then 'mid'::experience_level
       when gs % 5 = 2 then 'senior'::experience_level
       when gs % 5 = 3 then 'lead'::experience_level
       else 'executive'::experience_level end,
  case when gs % 2 = 0 then 'London, UK' else 'Remote' end,
  case when gs % 2 = 0 then false else true end,
  '$' || ((random() * 100 + 50)::int || 'k - $' || (random() * 100 + 150)::int || 'k'),
  case when random() < 0.6 then 'recommended'::job_status
       when random() < 0.8 then 'new'::job_status
       else 'locked'::job_status end,
  (random() * 100)::int,  -- matching_score 0-100
  ARRAY['Python', 'JavaScript', 'TypeScript', 'React', 'PostgreSQL'],  -- skills
  ARRAY[]::TEXT[],  -- skills_missing
  ARRAY[]::TEXT[],  -- recommended_for_courses
  'https://example.com/jobs/' || gs,
  true,
  case when gs % 5 = 0 then true else false end,  -- 20% featured
  now() - (gs || ' days')::interval,
  now() - (gs || ' days')::interval
from generate_series(1, 15) as gs
on conflict (id) do nothing;
*/

-- ============================================================================
-- TEMPLATE 5: Seed offers (tool discounts - not job offers)
-- NOTE: Our offers table is for tool discounts, not job offers
-- ============================================================================
-- Example: Add more tool discount offers
/*
insert into public.offers (
  id, title, provider, description, category, discount_text, discount_type, discount_value,
  discount_code, external_url, eligibility, recommended_for_courses, original_price,
  discounted_price, features, is_active, is_recommended, expiration_date, max_usage,
  created_at, updated_at
)
select
  gen_random_uuid(),  -- Replace with hardcoded UUID for deterministic seeding
  'Tool Offer ' || gs,
  case when gs % 3 = 0 then 'Provider A'
       when gs % 3 = 1 then 'Provider B'
       else 'Provider C' end,
  'Description for tool offer ' || gs,
  case when gs % 6 = 0 then 'api'::offer_category
       when gs % 6 = 1 then 'hosting'::offer_category
       when gs % 6 = 2 then 'database'::offer_category
       when gs % 6 = 3 then 'ai_llm'::offer_category
       when gs % 6 = 4 then 'tools'::offer_category
       else 'services'::offer_category end,
  case when gs % 2 = 0 then (random() * 50 + 10)::int || '% off' else '$' || (random() * 100 + 50)::int || ' free credits' end,
  case when gs % 2 = 0 then 'percentage'::discount_type else 'free_credits'::discount_type end,
  case when gs % 2 = 0 then (random() * 50 + 10)::numeric(10,2) else (random() * 100 + 50)::numeric(10,2) end,
  'CODE' || gs,
  'https://example.com/offers/' || gs,
  'New users only',
  ARRAY[]::TEXT[],  -- recommended_for_courses
  '$' || (random() * 100 + 20)::int || '/month',
  '$' || (random() * 50 + 10)::int || '/month',
  ARRAY['Feature 1', 'Feature 2', 'Feature 3'],
  true,
  case when gs % 3 = 0 then true else false end,  -- 33% recommended
  now() + ((random() * 90 + 30)::int || ' days')::interval,  -- expires in 30-120 days
  (random() * 200 + 50)::int,  -- max_usage 50-250
  now() - (gs || ' days')::interval,
  now() - (gs || ' days')::interval
from generate_series(1, 10) as gs
on conflict (id) do nothing;
*/

-- ============================================================================
-- TEMPLATE 6: Seed portfolio_projects (requires student_profiles)
-- ============================================================================
-- Example: Add portfolio projects for students
/*
insert into public.portfolio_projects (
  id, student_profile_id, title, description, github_url, demo_url, visibility,
  created_at, updated_at
)
select
  gen_random_uuid(),
  sp.id,
  'Project ' || row_number() over (partition by sp.id),
  'Description for project created by student ' || sp.id::text,
  'https://github.com/example/project-' || row_number() over (partition by sp.id),
  'https://example.com/demo-' || row_number() over (partition by sp.id),
  case when random() < 0.33 then 'private'::visibility_level
       when random() < 0.66 then 'recruiters_only'::visibility_level
       else 'public'::visibility_level end,
  now() - ((random() * 60)::int || ' days')::interval,
  now() - ((random() * 60)::int || ' days')::interval
from public.student_profiles sp
cross join generate_series(1, 3)  -- 3 projects per student
on conflict do nothing;
*/

-- ============================================================================
-- TEMPLATE 7: Seed questions (requires student_profiles)
-- ============================================================================
-- Example: Add questions from students
/*
insert into public.questions (
  id, student_profile_id, context_type, context_id, title, body, created_at, updated_at
)
select
  gen_random_uuid(),
  sp.id,
  case when random() < 0.5 then 'lesson'::question_context_type
       when random() < 0.8 then 'lab'::question_context_type
       else 'project'::question_context_type end,
  'context-' || (random() * 100)::int::text,
  'Question ' || row_number() over (partition by sp.id),
  'Body of question ' || row_number() over (partition by sp.id) || '. This is a test question.',
  now() - ((random() * 30)::int || ' days')::interval,
  now() - ((random() * 30)::int || ' days')::interval
from public.student_profiles sp
cross join generate_series(1, 2)  -- 2 questions per student
on conflict do nothing;
*/

-- ============================================================================
-- TEMPLATE 8: Seed event_attendance (requires events + profiles)
-- ============================================================================
-- Example: Add event attendance records
/*
insert into public.event_attendance (
  id, event_id, profile_id, rsvp_status, attended, created_at, updated_at
)
select
  gen_random_uuid(),
  e.id,
  p.id,
  case when random() < 0.6 then 'confirmed'
       when random() < 0.8 then 'pending'
       else 'cancelled' end,
  case when random() < 0.7 then false else true end,  -- 30% attended
  now() - ((random() * 14)::int || ' days')::interval,
  now() - ((random() * 14)::int || ' days')::interval
from public.events e
cross join lateral (
  select id from public.profiles order by random() limit 10
) p
where e.start_time > now()  -- Only future events
on conflict (event_id, profile_id) do nothing;
*/

COMMIT;

-- ============================================================================
-- USAGE NOTES:
-- ============================================================================
-- 1. Uncomment the template you want to use
-- 2. Replace gen_random_uuid() with hardcoded UUIDs for deterministic seeding
-- 3. Adjust the generate_series() ranges to control how many records are created
-- 4. Modify column values to match your actual data needs
-- 5. Run with: psql "$SUPABASE_DB_URL" -f supabase/seed/06_seed_example_templates.sql
--
-- Remember: These are TEMPLATES - adapt them to your actual schema and needs!
