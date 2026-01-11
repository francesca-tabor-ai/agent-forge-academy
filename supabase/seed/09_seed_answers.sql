-- Seed answers: answers to questions from students and tutors
-- NOTE: This table requires existing questions and profiles from auth.users
-- This script provides example queries that can be run AFTER questions exist
-- Answers can be created by students or tutors, and tutors can mark answers as accepted
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Dependencies:
-- - questions (depends on student_profiles, which depend on profiles)
-- - profiles (depends on auth.users - cannot be seeded directly)
-- - answers (depends on questions + profiles)

-- Example: Seed answers for existing questions
-- Creates answers from both students and tutors
-- Some answers are marked as accepted (by tutors)
-- Uncomment and modify when you have questions and profiles:
/*
DO $$
DECLARE
  question_record RECORD;
  answer_profile_id UUID;
  tutor_profile_id UUID;
  student_profile_id UUID;
  answer_counter INTEGER;
  base_time TIMESTAMPTZ;
  answer_bodies TEXT[] := ARRAY[
    'Great question! I had the same issue. Here''s what worked for me: First, make sure you''ve imported all the necessary modules. Then check your environment variables.',
    'This is a common problem. The solution is to update your dependencies. Run `npm install` or `pip install -r requirements.txt` depending on your setup.',
    'I found this helpful: The key is to understand the state management pattern. Try breaking down the problem into smaller steps.',
    'Based on my experience, you should check the documentation for the latest API changes. The syntax has been updated in recent versions.',
    'Here''s a step-by-step approach: 1) Verify your configuration, 2) Check the logs for errors, 3) Test with a simple example first.',
    'I recommend reviewing the course materials from Module 3. There''s a detailed explanation there that covers this exact scenario.',
    'The issue is likely related to async/await handling. Make sure you''re properly awaiting all promises in your code.',
    'Try this: Clear your cache and restart the development server. Sometimes the issue is just a stale state.',
    'This is a great learning opportunity! The concept you''re asking about is fundamental to understanding the architecture. Let me explain...',
    'I''ve encountered this before. The solution involves updating your error handling to catch edge cases you might not have considered.'
  ];
  tutor_answer_bodies TEXT[] := ARRAY[
    'Excellent question! This is a fundamental concept. Let me break it down: The key principle here is...',
    'I''m glad you asked this. This is a common point of confusion. The answer lies in understanding how...',
    'Great observation! This relates to a deeper concept we''ll cover later, but here''s the short answer:',
    'This is an important topic. Let me provide a comprehensive explanation: First, we need to understand...',
    'Perfect timing for this question! This concept builds on what we learned in the previous module. Here''s how it works:',
    'I see what you''re getting at. This is a nuanced topic, so let me clarify: The distinction is...',
    'This is a great question that many students have. The answer involves several interconnected concepts:',
    'You''re on the right track! To fully understand this, we need to consider: 1) The underlying mechanism, 2) How it applies in practice, 3) Common pitfalls to avoid.',
    'This is a critical concept for mastering the material. Here''s a detailed explanation with examples:',
    'Wonderful question! This demonstrates good analytical thinking. The solution requires understanding...'
  ];
BEGIN
  -- Get a tutor profile for accepted answers (if any tutors exist)
  SELECT p.id INTO tutor_profile_id
  FROM profiles p
  WHERE p.role IN ('tutor', 'instructor')
  ORDER BY RANDOM()
  LIMIT 1;
  
  -- Loop through questions and create answers
  FOR question_record IN 
    SELECT q.id as question_id, q.student_profile_id, q.title, q.body, q.created_at
    FROM questions q
    ORDER BY q.created_at
    LIMIT 20
  LOOP
    answer_counter := 0;
    base_time := question_record.created_at + INTERVAL '1 hour' + (RANDOM() * INTERVAL '2 days');
    
    -- Get the student profile for this question
    SELECT sp.profile_id INTO student_profile_id
    FROM student_profiles sp
    WHERE sp.id = question_record.student_profile_id;
    
    -- Create 1-3 answers per question
    FOR answer_counter IN 1..(1 + FLOOR(RANDOM() * 3)::INTEGER)
    LOOP
      -- Alternate between student and tutor answers
      IF answer_counter = 1 AND tutor_profile_id IS NOT NULL AND (RANDOM() > 0.5) THEN
        -- First answer from tutor (more likely to be accepted)
        answer_profile_id := tutor_profile_id;
        
        INSERT INTO answers (
          question_id,
          profile_id,
          body,
          is_accepted,
          created_at
        )
        VALUES (
          question_record.question_id,
          answer_profile_id,
          tutor_answer_bodies[1 + FLOOR(RANDOM() * (array_length(tutor_answer_bodies, 1) - 1))::INTEGER],
          CASE WHEN RANDOM() > 0.3 THEN true ELSE false END, -- 70% chance of being accepted
          base_time + (answer_counter * INTERVAL '30 minutes')
        );
      ELSE
        -- Answer from another student (or tutor if no students available)
        SELECT p.id INTO answer_profile_id
        FROM profiles p
        WHERE p.id != student_profile_id -- Don't answer your own question
          AND p.role IN ('student', 'tutor')
        ORDER BY RANDOM()
        LIMIT 1;
        
        -- If no other profiles found, skip this answer
        IF answer_profile_id IS NOT NULL THEN
          INSERT INTO answers (
            question_id,
            profile_id,
            body,
            is_accepted,
            created_at
          )
          VALUES (
            question_record.question_id,
            answer_profile_id,
            answer_bodies[1 + FLOOR(RANDOM() * (array_length(answer_bodies, 1) - 1))::INTEGER],
            false, -- Student answers are not accepted by default
            base_time + (answer_counter * INTERVAL '30 minutes')
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Seeded answers for questions';
END $$;
*/

-- Alternative: Simple seed with basic answers
-- Uncomment and modify when you have questions and profiles:
/*
DO $$
DECLARE
  question_record RECORD;
  answer_profile_id UUID;
  base_time TIMESTAMPTZ;
BEGIN
  -- Create one answer per question from available profiles
  FOR question_record IN 
    SELECT q.id as question_id, q.created_at
    FROM questions q
    ORDER BY q.created_at
    LIMIT 10
  LOOP
    -- Get a random profile (student or tutor) to answer
    SELECT p.id INTO answer_profile_id
    FROM profiles p
    WHERE p.role IN ('student', 'tutor')
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- If profile found, create answer
    IF answer_profile_id IS NOT NULL THEN
      base_time := question_record.created_at + INTERVAL '1 hour';
      
      INSERT INTO answers (
        question_id,
        profile_id,
        body,
        is_accepted,
        created_at
      )
      VALUES (
        question_record.question_id,
        answer_profile_id,
        'This is a helpful answer to your question. I hope this clarifies things!',
        false,
        base_time
      );
    END IF;
  END LOOP;
END $$;
*/

-- Example: Mark some tutor answers as accepted
-- This should be run after answers are created
-- Uncomment and modify when you have answers from tutors:
/*
UPDATE answers a
SET is_accepted = true
WHERE a.id IN (
  SELECT a2.id
  FROM answers a2
  JOIN profiles p ON a2.profile_id = p.id
  WHERE p.role IN ('tutor', 'instructor')
    AND a2.is_accepted = false
  ORDER BY RANDOM()
  LIMIT 10
);
*/

COMMIT;
