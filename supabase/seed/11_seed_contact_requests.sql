-- Seed contact_requests: requests from recruiters to students
-- NOTE: This table requires existing recruiter_profiles and student_profiles from auth.users
-- This script provides example queries that can be run AFTER recruiters and students have signed up
-- Contact requests allow recruiters to request permission to contact students
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Dependencies:
-- - recruiter_profiles (depends on profiles, which depend on auth.users)
-- - student_profiles (depends on profiles, which depend on auth.users)
-- - contact_requests (depends on recruiter_profiles + student_profiles)

-- IMPORTANT: There is a unique constraint on (recruiter_profile_id, student_profile_id) 
-- WHERE status = 'pending'. This means a recruiter can only have one pending request per student.
-- Once a request is approved/rejected/withdrawn, they can create a new one.

-- Example: Seed contact_requests for recruiters and students
-- Creates realistic contact requests with various statuses and messages
-- Uncomment and modify when you have recruiter_profiles and student_profiles:
/*
DO $$
DECLARE
  recruiter_record RECORD;
  student_record RECORD;
  request_status contact_request_status;
  request_message TEXT;
  request_time TIMESTAMPTZ;
  request_counter INTEGER := 0;
  status_distribution INTEGER;
  
  -- Pre-written message templates
  message_templates TEXT[] := ARRAY[
    'Hi! I came across your profile and I''m impressed by your AI/ML projects. I''d love to discuss potential opportunities at our company. Would you be open to a conversation?',
    'Hello! Your portfolio projects caught my attention, especially your work with multi-agent systems. We''re looking for talented AI engineers and I think you''d be a great fit. Interested in learning more?',
    'Hi there! I noticed your experience with RAG systems and agentic AI. We have several exciting roles that align with your skills. Would you be open to a brief chat?',
    'Hello! Your background in AI-native software development is exactly what we''re looking for. I''d love to connect and discuss potential opportunities. Are you open to a conversation?',
    'Hi! I''m reaching out because your projects demonstrate strong technical skills in AI/ML. We''re actively hiring for our AI team and I think you''d be a great addition. Interested in learning more?',
    'Hello! Your work on conversational commerce and recommender systems is impressive. We have opportunities that might interest you. Would you be available for a quick call?',
    'Hi there! I came across your profile and I''m interested in discussing career opportunities. Your experience with production AI systems is exactly what we need. Open to a conversation?',
    'Hello! Your portfolio shows strong expertise in AI visibility and SEO optimization. We''re looking for someone with your skills. Would you be interested in learning more about our team?',
    'Hi! I noticed your projects involving 3D commerce and synthetic media. We have exciting opportunities in this space. Would you be open to a brief discussion?',
    'Hello! Your background in AI governance and compliance is valuable. We''re building a team focused on responsible AI and I think you''d be a great fit. Interested?'
  ];
BEGIN
  -- Loop through recruiters and create contact requests
  FOR recruiter_record IN 
    SELECT rp.id as recruiter_profile_id, rp.company_name
    FROM recruiter_profiles rp
    ORDER BY rp.created_at
    LIMIT 5
  LOOP
    -- For each recruiter, create requests to multiple students
    FOR student_record IN 
      SELECT sp.id as student_profile_id, sp.visibility
      FROM student_profiles sp
      WHERE sp.visibility IN ('public', 'recruiters_only') -- Only visible students
      ORDER BY RANDOM()
      LIMIT (3 + FLOOR(RANDOM() * 5)::INTEGER) -- 3-7 requests per recruiter
    LOOP
      request_counter := request_counter + 1;
      request_time := NOW() - INTERVAL '30 days' + (RANDOM() * INTERVAL '29 days');
      
      -- Distribute statuses: 40% pending, 30% approved, 20% rejected, 10% withdrawn
      status_distribution := FLOOR(RANDOM() * 100)::INTEGER;
      IF status_distribution < 40 THEN
        request_status := 'pending'::contact_request_status;
      ELSIF status_distribution < 70 THEN
        request_status := 'approved'::contact_request_status;
      ELSIF status_distribution < 90 THEN
        request_status := 'rejected'::contact_request_status;
      ELSE
        request_status := 'withdrawn'::contact_request_status;
      END IF;
      
      -- Select a random message template
      request_message := message_templates[1 + FLOOR(RANDOM() * (array_length(message_templates, 1) - 1))::INTEGER];
      
      -- Insert contact request
      -- Check for existing pending request first (respects unique constraint)
      IF NOT EXISTS (
        SELECT 1 FROM contact_requests cr
        WHERE cr.recruiter_profile_id = recruiter_record.recruiter_profile_id
          AND cr.student_profile_id = student_record.student_profile_id
          AND cr.status = 'pending'
      ) THEN
        INSERT INTO contact_requests (
          recruiter_profile_id,
          student_profile_id,
          status,
          message,
          created_at
        )
        VALUES (
          recruiter_record.recruiter_profile_id,
          student_record.student_profile_id,
          request_status,
          request_message,
          request_time
        );
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Seeded % contact requests', request_counter;
END $$;
*/

-- Alternative: Simple seed with basic contact requests
-- Uncomment and modify when you have recruiter_profiles and student_profiles:
/*
DO $$
DECLARE
  recruiter_record RECORD;
  student_record RECORD;
  request_counter INTEGER := 0;
BEGIN
  -- Create contact requests from recruiters to visible students
  FOR recruiter_record IN 
    SELECT rp.id as recruiter_profile_id
    FROM recruiter_profiles rp
    ORDER BY rp.created_at
    LIMIT 3
  LOOP
    FOR student_record IN 
      SELECT sp.id as student_profile_id
      FROM student_profiles sp
      WHERE sp.visibility IN ('public', 'recruiters_only')
      ORDER BY RANDOM()
      LIMIT 5
    LOOP
      -- Check if there's already a pending request (respect unique constraint)
      IF NOT EXISTS (
        SELECT 1 FROM contact_requests cr
        WHERE cr.recruiter_profile_id = recruiter_record.recruiter_profile_id
          AND cr.student_profile_id = student_record.student_profile_id
          AND cr.status = 'pending'
      ) THEN
        INSERT INTO contact_requests (
          recruiter_profile_id,
          student_profile_id,
          status,
          message
        )
        VALUES (
          recruiter_record.recruiter_profile_id,
          student_record.student_profile_id,
          CASE (FLOOR(RANDOM() * 4)::INTEGER)
            WHEN 0 THEN 'pending'::contact_request_status
            WHEN 1 THEN 'approved'::contact_request_status
            WHEN 2 THEN 'rejected'::contact_request_status
            ELSE 'withdrawn'::contact_request_status
          END,
          'I would like to connect regarding potential opportunities.'
        );
        
        request_counter := request_counter + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Seeded % contact requests', request_counter;
END $$;
*/

-- Example: Create contact requests with realistic status progression
-- This creates requests that have been through status changes over time
-- Uncomment and modify when you have recruiter_profiles and student_profiles:
/*
DO $$
DECLARE
  recruiter_record RECORD;
  student_record RECORD;
  request_id_var UUID;
  request_time TIMESTAMPTZ;
BEGIN
  -- Create some approved requests (these trigger consent_events)
  FOR recruiter_record IN 
    SELECT rp.id as recruiter_profile_id
    FROM recruiter_profiles rp
    ORDER BY RANDOM()
    LIMIT 3
  LOOP
    FOR student_record IN 
      SELECT sp.id as student_profile_id
      FROM student_profiles sp
      WHERE sp.visibility IN ('public', 'recruiters_only')
      ORDER BY RANDOM()
      LIMIT 3
    LOOP
      -- Check for existing pending request
      IF NOT EXISTS (
        SELECT 1 FROM contact_requests cr
        WHERE cr.recruiter_profile_id = recruiter_record.recruiter_profile_id
          AND cr.student_profile_id = student_record.student_profile_id
          AND cr.status = 'pending'
      ) THEN
        request_time := NOW() - INTERVAL '7 days';
        
        -- Create request as approved (simulating it was approved after being pending)
        INSERT INTO contact_requests (
          recruiter_profile_id,
          student_profile_id,
          status,
          message,
          created_at
        )
        VALUES (
          recruiter_record.recruiter_profile_id,
          student_record.student_profile_id,
          'approved'::contact_request_status,
          'Hi! I''m interested in discussing career opportunities. Your AI/ML background is impressive and aligns with our needs.',
          request_time
        )
        RETURNING id INTO request_id_var;
        
        -- Note: The consent_events trigger will automatically create a consent event
        -- when a contact request is approved (if the trigger is active)
      END IF;
    END LOOP;
  END LOOP;
END $$;
*/

COMMIT;
